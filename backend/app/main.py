from fastapi import FastAPI, Depends, HTTPException, Query, status
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
        
    # Return posts ordered by ID or published date (newest first)
    return query.order_by(models.Post.published_at.desc()).all()

@app.get("/api/posts/{slug}", response_model=schemas.PostDetail)
def get_post_detail(slug: str, db: Session = Depends(get_db)):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Sort comments by creation date (newest first)
    post.comments = sorted(post.comments, key=lambda c: c.created_at, reverse=True)
    return post

@app.post("/api/posts/{slug}/comments", response_model=schemas.Comment)
def create_comment(
    slug: str,
    comment_in: schemas.CommentCreate,
    db: Session = Depends(get_db)
):
    post = db.query(models.Post).filter(models.Post.slug == slug).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    new_comment = models.Comment(
        post_id=post.id,
        author=comment_in.author.strip() or "Anónimo",
        content=comment_in.content.strip()
    )
    
    if not new_comment.content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comment content cannot be empty"
        )
        
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

@app.post("/api/newsletter/subscribe", response_model=schemas.NewsletterResponse)
def subscribe_newsletter(
    subscriber_in: schemas.NewsletterCreate,
    db: Session = Depends(get_db)
):
    email_clean = subscriber_in.email.strip().lower()
    
    # Check if already subscribed
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
