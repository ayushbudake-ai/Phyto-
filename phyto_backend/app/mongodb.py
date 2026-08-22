from __future__ import annotations

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import settings


def create_mongo_client() -> AsyncIOMotorClient | None:
    if not settings.MONGODB_URL:
        return None
    return AsyncIOMotorClient(settings.MONGODB_URL)


def get_phyto_db(client: AsyncIOMotorClient) -> AsyncIOMotorDatabase:
    return client[settings.MONGODB_DB_NAME]

