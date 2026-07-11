import os
import resend
import httpx
import cloudinary
import cloudinary.uploader
from fastapi import FastAPI, Depends, HTTPException, Query, Response, status, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from .database import engine, Base, get_db
from . import models, schemas
from .seed import seed_db

# Create database tables on startup (Neon/SQLite friendly)
Base.metadata.create_all(bind=engine)

# Auto seed database on startup
db_session = next(get_db())
try:
    seed_db(db_session)
except Exception as e:
    print(f"Error seeding database on startup: {e}")

ADMIN_SECRET = os.getenv("ADMIN_SECRET", "")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM", "Geopolitiqué <onboarding@resend.dev>")
# FRONTEND_URL admite varios orígenes separados por comas (producción +
# dominio propio, etc.). Se normaliza la barra final: el navegador nunca la
# envía en el header Origin, así que un '/' de más rompe el preflight de CORS.
_FRONTEND_ORIGINS = [
    o.strip().rstrip("/")
    for o in os.getenv("FRONTEND_URL", "https://geopolitique.vercel.app").split(",")
    if o.strip()
]
FRONTEND_URL = _FRONTEND_ORIGINS[0] if _FRONTEND_ORIGINS else "https://geopolitique.vercel.app"

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Cloudinary — SDK picks up CLOUDINARY_URL automatically if set
CLOUDINARY_URL_ENV = os.getenv("CLOUDINARY_URL", "")
if CLOUDINARY_URL_ENV:
    cloudinary.config(cloudinary_url=CLOUDINARY_URL_ENV)

TURNSTILE_SECRET = os.getenv("TURNSTILE_SECRET_KEY", "")

def verify_turnstile(token: str) -> bool:
    if not TURNSTILE_SECRET:
        return True  # skip if not configured
    with httpx.Client(timeout=5) as client:
        r = client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": TURNSTILE_SECRET, "response": token},
        )
        return r.json().get("success", False)

def verify_admin(authorization: str = Header(...)):
    if not authorization.startswith("Bearer ") or authorization[7:] != ADMIN_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado")

app = FastAPI(
    title="Geopolitiqué API",
    description="Sleek backend API for Geopolitiqué Blog",
    version="1.0.0"
)

# Enable CORS — restrict to known origins in production
_ALLOWED_ORIGINS = [
    *_FRONTEND_ORIGINS,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy"}

# ── Public endpoints ─────────────────────────────────────────────────────────

@app.get("/api/posts", response_model=List[schemas.Post])
def get_posts(
    response: Response,
    q: Optional[str] = Query(None, description="Search query in title, summary, or content"),
    category: Optional[str] = Query(None, description="Filter by category name"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(models.Post)

    if category:
        query = query.filter(models.Post.category.ilike(category))

    if q:
        search_filter = f"%{q}%"
        query = query.filter(
            (models.Post.title.ilike(search_filter)) |
            (models.Post.summary.ilike(search_filter)) |
            (models.Post.content.ilike(search_filter))
        )

    response.headers["Cache-Control"] = "public, max-age=300"
    return query.order_by(models.Post.published_at.desc()).offset(skip).limit(limit).all()

@app.get("/api/posts/{slug}", response_model=schemas.PostDetail)
def get_post_detail(slug: str, response: Response, db: Session = Depends(get_db)):
    post = (
        db.query(models.Post)
        .options(joinedload(models.Post.comments))
        .filter(models.Post.slug == slug)
        .first()
    )
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post.comments = sorted(post.comments, key=lambda c: c.created_at, reverse=True)
    response.headers["Cache-Control"] = "public, max-age=120"
    return post

@app.post("/api/posts/{slug}/comments", response_model=schemas.Comment)
def create_comment(slug: str, comment_in: schemas.CommentCreate, db: Session = Depends(get_db)):
    if TURNSTILE_SECRET and not verify_turnstile(comment_in.turnstile_token or ""):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verificación de seguridad fallida")

    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    new_comment = models.Comment(
        post_id=post.id,
        author=comment_in.author.strip() or "Anónimo",
        content=comment_in.content.strip()
    )

    if not new_comment.content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Comment content cannot be empty")

    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@app.post("/api/newsletter/subscribe", response_model=schemas.NewsletterResponse)
def subscribe_newsletter(subscriber_in: schemas.NewsletterCreate, db: Session = Depends(get_db)):
    email_clean = subscriber_in.email.strip().lower()

    existing = db.query(models.NewsletterSubscriber).filter(
        models.NewsletterSubscriber.email == email_clean
    ).first()

    if existing:
        return existing

    new_subscriber = models.NewsletterSubscriber(email=email_clean)
    db.add(new_subscriber)
    db.commit()
    db.refresh(new_subscriber)
    return new_subscriber

# ── Admin: Auth ──────────────────────────────────────────────────────────────

@app.post("/api/admin/login", response_model=schemas.AdminLoginResponse)
def admin_login(data: schemas.AdminLogin):
    if not ADMIN_SECRET or data.secret != ADMIN_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    return {"token": ADMIN_SECRET}

# ── Admin: Stats ─────────────────────────────────────────────────────────────

@app.get("/api/admin/stats", response_model=schemas.AdminStats)
def get_admin_stats(db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    return {
        "posts": db.query(models.Post).count(),
        "comments": db.query(models.Comment).count(),
        "subscribers": db.query(models.NewsletterSubscriber).count(),
    }

# ── Admin: Posts CRUD ────────────────────────────────────────────────────────

@app.post("/api/admin/posts", response_model=schemas.Post, status_code=status.HTTP_201_CREATED)
def create_post(post_in: schemas.PostCreate, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    if db.query(models.Post).filter(models.Post.slug == post_in.slug).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Slug ya en uso")

    db_post = models.Post(**post_in.model_dump(exclude_none=True))
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@app.put("/api/admin/posts/{slug}", response_model=schemas.Post)
def update_post(slug: str, post_in: schemas.PostUpdate, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")

    for field, value in post_in.model_dump(exclude_none=True).items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post

@app.delete("/api/admin/posts/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(slug: str, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")

    db.delete(post)
    db.commit()

# ── Admin: Comments ──────────────────────────────────────────────────────────

@app.get("/api/admin/comments", response_model=List[schemas.CommentDetail])
def get_all_comments(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    return db.query(models.Comment).order_by(models.Comment.created_at.desc()).offset(skip).limit(limit).all()

@app.delete("/api/admin/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado")

    db.delete(comment)
    db.commit()

# ── Admin: Newsletter ────────────────────────────────────────────────────────

@app.get("/api/admin/newsletter", response_model=List[schemas.NewsletterResponse])
def get_newsletter_subscribers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin),
):
    return db.query(models.NewsletterSubscriber).order_by(
        models.NewsletterSubscriber.subscribed_at.desc()
    ).offset(skip).limit(limit).all()

@app.delete("/api/admin/newsletter/{subscriber_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscriber(subscriber_id: int, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    sub = db.query(models.NewsletterSubscriber).filter(models.NewsletterSubscriber.id == subscriber_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suscriptor no encontrado")

    db.delete(sub)
    db.commit()

# ── Admin: Newsletter broadcast ───────────────────────────────────────────────

@app.post("/api/admin/posts/{slug}/notify", response_model=schemas.NotifyResult)
def notify_subscribers(slug: str, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    if not RESEND_API_KEY:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Resend no configurado")

    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post no encontrado")

    subscribers = db.query(models.NewsletterSubscriber).all()
    if not subscribers:
        return {"sent": 0, "message": "No hay suscriptores"}

    emails = [s.email for s in subscribers]
    post_url = f"{FRONTEND_URL}/posts/{post.slug}"
    category_label = post.category or "General"
    image_block = (
        f'<img src="{post.image_url}" alt="" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;margin-bottom:24px;" />'
        if post.image_url else ""
    )

    html_body = f"""
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fbfaf8;border-radius:12px;overflow:hidden;border:1px solid #e2ded7;max-width:600px;">

        <!-- Header -->
        <tr><td style="background:#2c2521;padding:24px 36px;">
          <p style="margin:0;font-family:Georgia,serif;font-size:20px;font-weight:700;color:#c2a175;letter-spacing:-0.02em;">
            Geopolitiqué
          </p>
          <p style="margin:4px 0 0;font-size:11px;color:#79736e;letter-spacing:0.1em;text-transform:uppercase;font-family:system-ui,sans-serif;">
            Circular de análisis geopolítico
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 36px 28px;">
          <p style="margin:0 0 20px;font-size:11px;color:#a35d3d;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;font-family:system-ui,sans-serif;">
            Nuevo artículo · {category_label} · {post.read_time} min
          </p>
          {image_block}
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:800;color:#2c2521;line-height:1.25;letter-spacing:-0.02em;">
            {post.title}
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#4a443f;line-height:1.7;font-family:system-ui,sans-serif;">
            {post.summary}
          </p>
          <a href="{post_url}" style="display:inline-block;background:#a35d3d;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:700;font-family:system-ui,sans-serif;letter-spacing:0.02em;">
            Leer artículo completo →
          </a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 36px 28px;border-top:1px solid #e2ded7;">
          <p style="margin:0;font-size:11px;color:#79736e;font-family:system-ui,sans-serif;line-height:1.6;">
            Recibes este correo porque te suscribiste a la newsletter de Geopolitiqué.<br/>
            <a href="{FRONTEND_URL}" style="color:#a35d3d;text-decoration:none;">Visitar el blog</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
"""

    params: resend.Emails.SendParams = {
        "from": RESEND_FROM,
        "to": emails,
        "subject": f"Nuevo artículo: {post.title}",
        "html": html_body,
    }
    resend.Emails.send(params)

    return {"sent": len(emails), "message": f"Notificación enviada a {len(emails)} suscriptor{'es' if len(emails) != 1 else ''}"}

# ── Admin: Image upload (Cloudinary) ─────────────────────────────────────────

@app.post("/api/admin/upload", response_model=schemas.UploadResult)
async def upload_image(file: UploadFile = File(...), _: str = Depends(verify_admin)):
    if not CLOUDINARY_URL_ENV:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Cloudinary no configurado")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo debe ser una imagen")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La imagen no puede superar 10 MB")
    result = cloudinary.uploader.upload(
        contents,
        folder="geopolitique",
        use_filename=True,
        unique_filename=True,
        overwrite=False,
        transformation=[{"quality": "auto", "fetch_format": "auto"}],
    )
    return {"url": result["secure_url"], "public_id": result["public_id"]}
