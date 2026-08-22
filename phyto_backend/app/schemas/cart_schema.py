from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.product_schema import ProductOut


class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    include_kit: bool = False
    include_service: bool = False


class CartItemUpdate(BaseModel):
    quantity: Optional[int] = Field(default=None, ge=1)
    include_kit: Optional[bool] = None
    include_service: Optional[bool] = None


class CartItemOut(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    include_kit: bool = False
    include_service: bool = False
    product: Optional[ProductOut] = None

    model_config = {"from_attributes": True}


class CartOut(BaseModel):
    id: int
    user_id: int
    items: list[CartItemOut] = []
    total_items: int = 0
    subtotal: float = 0.0
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
