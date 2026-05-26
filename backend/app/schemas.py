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

class PostBasic(BaseModel):
    id: int
    slug: str
    title: str

    class Config:
        from_attributes = True

class CommentDetail(Comment):
    post: PostBasic

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
    published_at: Optional[datetime] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    read_time: Optional[int] = None
    image_url: Optional[str] = None
    published_at: Optional[datetime] = None

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

# Admin Schemas
class AdminLogin(BaseModel):
    secret: str

class AdminLoginResponse(BaseModel):
    token: str

class AdminStats(BaseModel):
    posts: int
    comments: int
    subscribers: int

class NotifyResult(BaseModel):
    sent: int
    message: str

class UploadResult(BaseModel):
    url: str
    public_id: str
