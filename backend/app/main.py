import os
from fastapi import FastAPI, Depends, HTTPException, Query, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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

def verify_admin(authorization: str = Header(...)):
    if not authorization.startswith("Bearer ") or authorization[7:] != ADMIN_SECRET:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No autorizado")

app = FastAPI(
    title="Geopolitiqué API",
    description="Sleek backend API for Geopolitiqué Blog",
    version="1.0.0"
)

# Enable CORS for Next.js frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For flexible local development
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
    q: Optional[str] = Query(None, description="Search query in title, summary, or content"),
    category: Optional[str] = Query(None, description="Filter by category name"),
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

    return query.order_by(models.Post.published_at.desc()).all()

@app.get("/api/posts/{slug}", response_model=schemas.PostDetail)
def get_post_detail(slug: str, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")

    post.comments = sorted(post.comments, key=lambda c: c.created_at, reverse=True)
    return post

@app.post("/api/posts/{slug}/comments", response_model=schemas.Comment)
def create_comment(slug: str, comment_in: schemas.CommentCreate, db: Session = Depends(get_db)):
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
def get_all_comments(db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    return db.query(models.Comment).order_by(models.Comment.created_at.desc()).all()

@app.delete("/api/admin/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(comment_id: int, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comentario no encontrado")

    db.delete(comment)
    db.commit()

# ── Admin: Newsletter ────────────────────────────────────────────────────────

@app.get("/api/admin/newsletter", response_model=List[schemas.NewsletterResponse])
def get_newsletter_subscribers(db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    return db.query(models.NewsletterSubscriber).order_by(
        models.NewsletterSubscriber.subscribed_at.desc()
    ).all()

@app.delete("/api/admin/newsletter/{subscriber_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subscriber(subscriber_id: int, db: Session = Depends(get_db), _: str = Depends(verify_admin)):
    sub = db.query(models.NewsletterSubscriber).filter(models.NewsletterSubscriber.id == subscriber_id).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Suscriptor no encontrado")

    db.delete(sub)
    db.commit()
