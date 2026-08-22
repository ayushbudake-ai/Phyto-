import os
from typing import Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload

from app.auth_utils import get_db, require_roles, get_current_user
from app.models.all_models import (
    Product,
    ProductImage,
    ProductTag,
    Category,
    User,
    UserRole,
    ProductType,
    Sunlight,
    Smell,
    Environment,
)
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductOut,
    ProductListResponse,
    ProductImageSchema,
    ProductTagSchema,
)
from app.services.image_service import save_product_image

router = APIRouter()


def _to_product_out(p: Product) -> ProductOut:
    primary_img = None
    if p.images:
        for img in p.images:
            if img.is_primary:
                primary_img = img.image_url
                break
        if not primary_img and len(p.images) > 0:
            primary_img = p.images[0].image_url

    return ProductOut(
        id=p.id,
        nursery_id=p.nursery_id,
        category_id=p.category_id,
        name=p.name,
        description=p.description,
        price=float(p.price) if p.price is not None else 0.0,
        stock=p.stock or 0,
        type=p.type,
        sunlight=p.sunlight,
        smell=p.smell,
        environment=p.environment,
        water_requirement=p.water_requirement,
        care_notes=p.care_notes,
        kit_available=bool(p.kit_available),
        service_available=bool(p.service_available),
        popularity_score=float(p.popularity_score) if p.popularity_score is not None else 0.0,
        is_active=bool(p.is_active),
        created_at=p.created_at,
        images=[
            ProductImageSchema(
                id=img.id,
                image_url=img.image_url,
                is_primary=bool(img.is_primary),
                sort_order=img.sort_order or 0,
            )
            for img in (p.images or [])
        ],
        tags=[
            ProductTagSchema(id=t.id, tag=t.tag)
            for t in (p.tags or [])
        ],
        image_url=primary_img,
    )


@router.get("", response_model=ProductListResponse)
async def list_products(
    category_id: Optional[int] = None,
    type: Optional[ProductType] = None,
    sunlight: Optional[Sunlight] = None,
    smell: Optional[Smell] = None,
    environment: Optional[Environment] = None,
    tag: Optional[str] = None,
    price_max: Optional[float] = None,
    q: Optional[str] = None,
    is_active: Optional[bool] = True,
    sort_by: Optional[str] = Query("popularity", pattern="^(popularity|price_asc|price_desc|newest)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Product)

    if is_active is not None:
        query = query.where(Product.is_active == is_active)
    if category_id:
        query = query.where(Product.category_id == category_id)
    if type:
        query = query.where(Product.type == type)
    if sunlight:
        query = query.where(Product.sunlight == sunlight)
    if smell:
        query = query.where(Product.smell == smell)
    if environment:
        query = query.where(or_(Product.environment == environment, Product.environment == Environment.both))
    if price_max is not None:
        query = query.where(Product.price <= price_max)
    if q:
        search_pattern = f"%{q}%"
        query = query.where(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )
    if tag:
        query = query.join(Product.tags).where(ProductTag.tag == tag)

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar_one_or_none() or 0

    # Sorting
    if sort_by == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.popularity_score.desc())

    # Pagination + eager loading
    query = query.options(selectinload(Product.images), selectinload(Product.tags)).offset(skip).limit(limit)
    res = await db.execute(query)
    products = res.scalars().all()

    items = [_to_product_out(p) for p in products]
    return ProductListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=ProductOut)
async def get_product(id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(
        select(Product)
        .options(selectinload(Product.images), selectinload(Product.tags))
        .where(Product.id == id)
    )
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _to_product_out(product)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.nursery)),
    db: AsyncSession = Depends(get_db),
):
    product = Product(
        nursery_id=current_user.id if current_user.role == UserRole.nursery else None,
        category_id=data.category_id,
        name=data.name,
        description=data.description,
        price=data.price,
        stock=data.stock,
        type=data.type,
        sunlight=data.sunlight,
        smell=data.smell,
        environment=data.environment,
        water_requirement=data.water_requirement,
        care_notes=data.care_notes,
        kit_available=data.kit_available,
        service_available=data.service_available,
        popularity_score=data.popularity_score,
        is_active=data.is_active,
    )
    db.add(product)
    await db.flush()

    if data.tags:
        for tag_str in data.tags:
            tag = ProductTag(product_id=product.id, tag=tag_str.strip().lower())
            db.add(tag)

    await db.commit()
    await db.refresh(product)
    return await get_product(product.id, db)


@router.put("/{id}", response_model=ProductOut)
async def update_product(
    id: int,
    data: ProductUpdate,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.nursery)),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Product).where(Product.id == id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if current_user.role == UserRole.nursery and product.nursery_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another nursery's product")

    update_dict = data.model_dump(exclude_unset=True)
    tags_data = update_dict.pop("tags", None)

    for field, val in update_dict.items():
        setattr(product, field, val)

    if tags_data is not None:
        # Replace tags
        existing_tags = await db.execute(select(ProductTag).where(ProductTag.product_id == id))
        for t in existing_tags.scalars().all():
            await db.delete(t)
        for tag_str in tags_data:
            tag = ProductTag(product_id=product.id, tag=tag_str.strip().lower())
            db.add(tag)

    await db.commit()
    await db.refresh(product)
    return await get_product(product.id, db)


@router.delete("/{id}")
async def delete_product(
    id: int,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.nursery)),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Product).where(Product.id == id))
    product = res.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if current_user.role == UserRole.nursery and product.nursery_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another nursery's product")

    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}


@router.post("/{id}/images")
async def upload_product_image(
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.nursery)),
    db: AsyncSession = Depends(get_db),
):
    product_result = await db.execute(select(Product).where(Product.id == id))
    product = product_result.scalars().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if current_user.role == UserRole.nursery and product.nursery_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot upload image for another nursery's product")

    image_url = save_product_image(file, id)

    result = await db.execute(select(ProductImage).where(ProductImage.product_id == id))
    existing_images = result.scalars().all()
    is_primary = len(existing_images) == 0

    new_image = ProductImage(
        product_id=id,
        image_url=image_url,
        is_primary=is_primary,
        sort_order=len(existing_images),
    )
    db.add(new_image)
    await db.commit()
    await db.refresh(new_image)

    return {
        "id": new_image.id,
        "image_url": new_image.image_url,
        "is_primary": new_image.is_primary,
    }


@router.delete("/{id}/images/{image_id}")
async def delete_product_image(
    id: int,
    image_id: int,
    current_user: User = Depends(require_roles(UserRole.admin, UserRole.nursery)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProductImage).where(ProductImage.id == image_id, ProductImage.product_id == id)
    )
    image_record = result.scalars().first()
    if not image_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found")

    file_path = image_record.image_url.lstrip("/")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    await db.delete(image_record)
    await db.commit()

    if image_record.is_primary:
        remaining_result = await db.execute(
            select(ProductImage).where(ProductImage.product_id == id).order_by(ProductImage.sort_order)
        )
        remaining = remaining_result.scalars().first()
        if remaining:
            remaining.is_primary = True
            await db.commit()

    return {"message": "Image deleted successfully"}