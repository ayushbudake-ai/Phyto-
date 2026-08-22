from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.auth_utils import get_db, require_roles
from app.models.all_models import Product, Order, OrderStatus, User, UserRole
from app.schemas.product_schema import ProductOut
from app.schemas.order_schema import OrderOut
from app.routers.products import _to_product_out
from app.routers.orders import _format_order_out

router = APIRouter()


@router.get("/dashboard")
async def get_nursery_dashboard(
    current_user: User = Depends(require_roles(UserRole.nursery, UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    nursery_id = current_user.id

    # Total products
    prod_count_query = select(func.count(Product.id)).where(Product.nursery_id == nursery_id)
    total_products = (await db.execute(prod_count_query)).scalar_one_or_none() or 0

    # Low stock products (stock <= 5)
    low_stock_query = select(func.count(Product.id)).where(
        Product.nursery_id == nursery_id, Product.stock <= 5, Product.is_active == True
    )
    low_stock = (await db.execute(low_stock_query)).scalar_one_or_none() or 0

    # Orders count by status
    pending_orders_query = select(func.count(Order.id)).where(
        Order.nursery_id == nursery_id, Order.status == OrderStatus.pending
    )
    pending_orders = (await db.execute(pending_orders_query)).scalar_one_or_none() or 0

    delivered_orders_query = select(func.count(Order.id)).where(
        Order.nursery_id == nursery_id, Order.status == OrderStatus.delivered
    )
    delivered_orders = (await db.execute(delivered_orders_query)).scalar_one_or_none() or 0

    # Total revenue from delivered orders
    revenue_query = select(func.sum(Order.total_amount)).where(
        Order.nursery_id == nursery_id, Order.status == OrderStatus.delivered
    )
    total_revenue = (await db.execute(revenue_query)).scalar_one_or_none() or 0.0

    return {
        "nursery_id": nursery_id,
        "nursery_name": current_user.name,
        "total_products": total_products,
        "low_stock_products": low_stock,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "total_revenue": float(total_revenue),
    }


@router.get("/products", response_model=list[ProductOut])
async def get_nursery_products(
    current_user: User = Depends(require_roles(UserRole.nursery, UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.tags))
        .where(Product.nursery_id == current_user.id)
        .order_by(Product.created_at.desc())
    )
    products = res.scalars().all()
    return [_to_product_out(p) for p in products]


@router.get("/orders", response_model=list[OrderOut])
async def get_nursery_orders(
    current_user: User = Depends(require_roles(UserRole.nursery, UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(Product.images),
            selectinload(Order.items).selectinload(Product.tags),
        )
        .where(Order.nursery_id == current_user.id)
        .order_by(Order.placed_at.desc())
    )
    orders = res.scalars().all()
    return [_format_order_out(o) for o in orders]