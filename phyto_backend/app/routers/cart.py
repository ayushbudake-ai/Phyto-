from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.auth_utils import get_db, get_current_user
from app.models.all_models import Cart, CartItem, Product, User
from app.schemas.cart_schema import CartOut, CartItemOut, CartItemAdd, CartItemUpdate
from app.routers.products import _to_product_out

router = APIRouter()


async def _get_or_create_cart(user_id: int, db: AsyncSession) -> Cart:
    res = await db.execute(
        select(Cart)
        .options(
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images),
            selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.tags),
        )
        .where(Cart.user_id == user_id)
    )
    cart = res.scalars().first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        # Refetch with relations
        res = await db.execute(
            select(Cart)
            .options(
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.images),
                selectinload(Cart.items).selectinload(CartItem.product).selectinload(Product.tags),
            )
            .where(Cart.user_id == user_id)
        )
        cart = res.scalars().first()
    return cart


def _format_cart_out(cart: Cart) -> CartOut:
    items_out = []
    subtotal = 0.0
    total_items = 0
    for it in cart.items:
        prod_out = _to_product_out(it.product) if it.product else None
        item_price = float(it.product.price) if (it.product and it.product.price) else 0.0
        subtotal += item_price * it.quantity
        total_items += it.quantity
        items_out.append(
            CartItemOut(
                id=it.id,
                cart_id=it.cart_id,
                product_id=it.product_id,
                quantity=it.quantity,
                include_kit=bool(it.include_kit),
                include_service=bool(it.include_service),
                product=prod_out,
            )
        )

    return CartOut(
        id=cart.id,
        user_id=cart.user_id,
        items=items_out,
        total_items=total_items,
        subtotal=round(subtotal, 2),
        updated_at=cart.updated_at,
    )


@router.get("", response_model=CartOut)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await _get_or_create_cart(current_user.id, db)
    return _format_cart_out(cart)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_200_OK)
async def add_item_to_cart(
    data: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify product exists
    prod_res = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.tags))
        .where(Product.id == data.product_id)
    )
    product = prod_res.scalars().first()
    if not product or not product.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or inactive")

    cart = await _get_or_create_cart(current_user.id, db)

    # Check if item with matching options already in cart
    existing_item = next(
        (
            it for it in cart.items
            if it.product_id == data.product_id
            and it.include_kit == data.include_kit
            and it.include_service == data.include_service
        ),
        None,
    )

    if existing_item:
        existing_item.quantity += data.quantity
    else:
        new_item = CartItem(
            cart_id=cart.id,
            product_id=data.product_id,
            quantity=data.quantity,
            include_kit=data.include_kit,
            include_service=data.include_service,
            product=product,
        )
        cart.items.append(new_item)
        db.add(new_item)

    await db.commit()
    return _format_cart_out(cart)


@router.patch("/items/{item_id}", response_model=CartOut)
async def update_cart_item(
    item_id: int,
    data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await _get_or_create_cart(current_user.id, db)
    item = next((it for it in cart.items if it.id == item_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    if data.quantity is not None:
        item.quantity = data.quantity
    if data.include_kit is not None:
        item.include_kit = data.include_kit
    if data.include_service is not None:
        item.include_service = data.include_service

    await db.commit()
    return _format_cart_out(cart)


@router.delete("/items/{item_id}", response_model=CartOut)
async def remove_cart_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await _get_or_create_cart(current_user.id, db)
    item = next((it for it in cart.items if it.id == item_id), None)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    cart.items.remove(item)
    await db.delete(item)
    await db.commit()
    return _format_cart_out(cart)


@router.delete("", response_model=CartOut)
async def clear_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cart = await _get_or_create_cart(current_user.id, db)
    for it in list(cart.items):
        await db.delete(it)
    cart.items.clear()

    await db.commit()
    return _format_cart_out(cart)