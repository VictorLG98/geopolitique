from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# Comment Schemas
class CommentBase(BaseModel):
    author: str
    content: str

class CommentCreate(CommentBase):
    pass

class Comment(CommentBase):
    id: int
    post_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Post Schemas
class PostBase(BaseModel):
    slug: str
    title: str
    summary: str
    content: str
    category: str
    read_time: int
    image_url: Optional[str] = None

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    published_at: datetime

    class Config:
        from_attributes = True

class PostDetail(Post):
    comments: List[Comment] = []

    class Config:
        from_attributes = True

# Newsletter Schemas
class NewsletterCreate(BaseModel):
    email: EmailStr

class NewsletterResponse(BaseModel):
    id: int
    email: EmailStr
    subscribed_at: datetime

    class Config:
        from_attributes = True
