from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ArticleBase(BaseModel):
    title: str
    slug: str
    content: str
    excerpt: Optional[str] = None
    cover_image_url: Optional[str] = None
    is_published: bool = True


class ArticleCreate(ArticleBase):
    pass


class ArticleOut(ArticleBase):
    id: int
    author_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
