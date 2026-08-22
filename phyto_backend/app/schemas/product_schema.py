from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.all_models import ProductType, Sunlight, Smell, Environment


class ProductTagSchema(BaseModel):
    id: Optional[int] = None
    tag: str

    model_config = {"from_attributes": True}


class ProductImageSchema(BaseModel):
    id: int
    image_url: str
    is_primary: bool = False
    sort_order: int = 0

    model_config = {"from_attributes": True}


class CategoryOut(BaseModel):
    id: int
    name: str
    slug: str
    icon_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    type: Optional[ProductType] = ProductType.plant
    sunlight: Optional[Sunlight] = None
    smell: Optional[Smell] = None
    environment: Optional[Environment] = None
    water_requirement: Optional[str] = None
    care_notes: Optional[str] = None
    kit_available: bool = False
    service_available: bool = False
    popularity_score: float = 0.0
    is_active: bool = True
    category_id: Optional[int] = None


class ProductCreate(ProductBase):
    tags: Optional[list[str]] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    type: Optional[ProductType] = None
    sunlight: Optional[Sunlight] = None
    smell: Optional[Smell] = None
    environment: Optional[Environment] = None
    water_requirement: Optional[str] = None
    care_notes: Optional[str] = None
    kit_available: Optional[bool] = None
    service_available: Optional[bool] = None
    popularity_score: Optional[float] = None
    is_active: Optional[bool] = None
    category_id: Optional[int] = None
    tags: Optional[list[str]] = None


class ProductOut(BaseModel):
    id: int
    nursery_id: Optional[int] = None
    category_id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    stock: int
    type: Optional[ProductType] = None
    sunlight: Optional[Sunlight] = None
    smell: Optional[Smell] = None
    environment: Optional[Environment] = None
    water_requirement: Optional[str] = None
    care_notes: Optional[str] = None
    kit_available: bool = False
    service_available: bool = False
    popularity_score: float = 0.0
    is_active: bool = True
    created_at: Optional[datetime] = None
    images: list[ProductImageSchema] = []
    tags: list[ProductTagSchema] = []
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    items: list[ProductOut]
    total: int
    skip: int
    limit: int
