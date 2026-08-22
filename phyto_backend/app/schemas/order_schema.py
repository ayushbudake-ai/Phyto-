from __future__ import annotations
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.models.all_models import OrderStatus, PaymentMethod, PaymentStatus
from app.schemas.product_schema import ProductOut


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    include_kit: bool = False
    include_service: bool = False


class OrderCreate(BaseModel):
    shipping_name: str
    shipping_street: str
    shipping_city: str
    shipping_pincode: str
    shipping_phone: str
    payment_method: PaymentMethod = PaymentMethod.cod
    items: Optional[list[OrderItemCreate]] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    delivery_partner_id: Optional[int] = None


class OrderItemOut(BaseModel):
    id: int
    order_id: int
    product_id: int
    product_name: str
    unit_price: float
    quantity: int
    include_kit: bool = False
    include_service: bool = False
    product: Optional[ProductOut] = None

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    customer_id: int
    nursery_id: Optional[int] = None
    delivery_partner_id: Optional[int] = None
    status: OrderStatus
    total_amount: float
    payment_method: PaymentMethod
    payment_status: PaymentStatus
    shipping_name: Optional[str] = None
    shipping_street: Optional[str] = None
    shipping_city: Optional[str] = None
    shipping_pincode: Optional[str] = None
    shipping_phone: Optional[str] = None
    placed_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    items: list[OrderItemOut] = []

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    items: list[OrderOut]
    total: int
