from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.auth_utils import get_db, get_current_user, require_roles
from app.models.all_models import User, UserRole
from app.schemas.user_schema import UserOut, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserOut)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.put("/me", response_model=UserOut)
async def update_my_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_dict = data.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(current_user, field, val)

    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.get("", response_model=list[UserOut])
async def list_users(
    role: Optional[UserRole] = None,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    res = await db.execute(query)
    users = res.scalars().all()
    return [UserOut.model_validate(u) for u in users]


@router.get("/{id}", response_model=UserOut)
async def get_user_by_id(
    id: int,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(User).where(User.id == id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserOut.model_validate(user)


@router.patch("/{id}/role", response_model=UserOut)
async def update_user_role(
    id: int,
    role: UserRole,
    current_user: User = Depends(require_roles(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(User).where(User.id == id))
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.role = role
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)