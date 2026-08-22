from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.auth_utils import get_db, get_current_user, require_roles
from app.models.all_models import (
    Order,
    OrderItem,
    OrderStatus,
    PaymentMethod,
    PaymentStatus,
    Product,
    Cart,
    CartItem,
    User,
    UserRole,
)
from app.schemas.order_schema import (
    OrderCreate,
    OrderStatusUpdate,
    OrderOut,
    OrderItemOut,
    OrderListResponse,
)
from app.routers.products import _to_product_out

router = APIRouter()


def _format_order_out(order: Order) -> OrderOut:
    items_out = []
    for it in order.items:
        prod_out = _to_product_out(it.product) if it.product else None
        items_out.append(
            OrderItemOut(
                id=it.id,
                order_id=it.order_id,
                product_id=it.product_id,
                product_name=it.product_name,
                unit_price=float(it.unit_price) if it.unit_price is not None else 0.0,
                quantity=it.quantity,
                include_kit=bool(it.include_kit),
                include_service=bool(it.include_service),
                product=prod_out,
            )
        )

    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        nursery_id=order.nursery_id,
        delivery_partner_id=order.delivery_partner_id,
        status=order.status,
        total_amount=float(order.total_amount) if order.total_amount is not None else 0.0,
        payment_method=order.payment_method,
        payment_status=order.payment_status,
        shipping_name=order.shipping_name,
        shipping_street=order.shipping_street,
        shipping_city=order.shipping_city,
        shipping_pincode=order.shipping_pincode,
        shipping_phone=order.shipping_phone,
        placed_at=order.placed_at,
        updated_at=order.updated_at,
        items=items_out,
    )


async def _fetch_order_with_relations(order_id: int, db: AsyncSession) -> Optional[Order]:
    res = await db.execute(
        select(Order)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.tags),
        )
        .where(Order.id == order_id)
    )
    return res.scalars().first()


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    items_to_order = []
    clear_cart_after = False

    if data.items and len(data.items) > 0:
        for it in data.items:
            prod_res = await db.execute(select(Product).where(Product.id == it.product_id))
            product = prod_res.scalars().first()
            if not product or not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {it.product_id} not available",
                )
            items_to_order.append({
                "product": product,
                "quantity": it.quantity,
                "include_kit": it.include_kit,
                "include_service": it.include_service,
            })
    else:
        # Checkout from current cart
        cart_res = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items).selectinload(CartItem.product))
            .where(Cart.user_id == current_user.id)
        )
        cart = cart_res.scalars().first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty and no items specified",
            )
        for it in cart.items:
            if not it.product or not it.product.is_active:
                continue
            items_to_order.append({
                "product": it.product,
                "quantity": it.quantity,
                "include_kit": it.include_kit,
                "include_service": it.include_service,
            })
        clear_cart_after = True

    if not items_to_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid items to place order",
        )

    # Calculate total and determine primary nursery_id
    total = 0.0
    primary_nursery_id = None
    for entry in items_to_order:
        p = entry["product"]
        price = float(p.price) if p.price is not None else 0.0
        total += price * entry["quantity"]
        if not primary_nursery_id and p.nursery_id:
            primary_nursery_id = p.nursery_id

    order = Order(
        customer_id=current_user.id,
        nursery_id=primary_nursery_id,
        status=OrderStatus.pending,
        total_amount=round(total, 2),
        payment_method=data.payment_method,
        payment_status=PaymentStatus.pending,
        shipping_name=data.shipping_name,
        shipping_street=data.shipping_street,
        shipping_city=data.shipping_city,
        shipping_pincode=data.shipping_pincode,
        shipping_phone=data.shipping_phone,
    )
    db.add(order)
    await db.flush()

    for entry in items_to_order:
        p = entry["product"]
        order_item = OrderItem(
            order_id=order.id,
            product_id=p.id,
            product_name=p.name,
            unit_price=p.price or 0.0,
            quantity=entry["quantity"],
            include_kit=entry["include_kit"],
            include_service=entry["include_service"],
        )
        db.add(order_item)

    if clear_cart_after:
        cart_res = await db.execute(
            select(Cart)
            .options(selectinload(Cart.items))
            .where(Cart.user_id == current_user.id)
        )
        cart = cart_res.scalars().first()
        if cart:
            for it in list(cart.items):
                await db.delete(it)

    await db.commit()
    created_order = await _fetch_order_with_relations(order.id, db)
    return _format_order_out(created_order)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status_filter: Optional[OrderStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Order)

    if current_user.role == UserRole.customer:
        query = query.where(Order.customer_id == current_user.id)
    elif current_user.role == UserRole.nursery:
        query = query.where(Order.nursery_id == current_user.id)
    elif current_user.role == UserRole.delivery:
        query = query.where(
            (Order.delivery_partner_id == current_user.id)
            | (Order.status.in_([OrderStatus.confirmed, OrderStatus.shipped]))
        )
    # Admin sees all

    if status_filter:
        query = query.where(Order.status == status_filter)

    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar_one_or_none() or 0

    query = (
        query.options(
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.images),
            selectinload(Order.items).selectinload(OrderItem.product).selectinload(Product.tags),
        )
        .order_by(Order.placed_at.desc())
    )
    res = await db.execute(query)
    orders = res.scalars().all()

    items = [_format_order_out(o) for o in orders]
    return OrderListResponse(items=items, total=total)


@router.get("/{id}", response_model=OrderOut)
async def get_order(
    id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await _fetch_order_with_relations(id, db)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role == UserRole.customer and order.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if current_user.role == UserRole.nursery and order.nursery_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    return _format_order_out(order)


@router.patch("/{id}/status", response_model=OrderOut)
async def update_order_status(
    id: int,
    data: OrderStatusUpdate,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.nursery, UserRole.delivery)),
    db: AsyncSession = Depends(get_db),
):
    order = await _fetch_order_with_relations(id, db)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if current_user.role == UserRole.nursery and order.nursery_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    order.status = data.status
    if data.delivery_partner_id is not None:
        order.delivery_partner_id = data.delivery_partner_id
    elif current_user.role == UserRole.delivery and not order.delivery_partner_id:
        order.delivery_partner_id = current_user.id

    if data.status == OrderStatus.delivered and order.payment_method == PaymentMethod.cod:
        order.payment_status = PaymentStatus.completed

    await db.commit()
    updated = await _fetch_order_with_relations(id, db)
    return _format_order_out(updated)