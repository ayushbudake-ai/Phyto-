from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.database import SessionLocal
from app.models.all_models import Environment, Product, ProductType, Smell, Sunlight


SEED_PRODUCTS = [
    {
        "id": 1,
        "name": "Monstera Deliciosa",
        "description": "The iconic Swiss cheese plant with dramatic split leaves.",
        "price": Decimal("1499.00"),
        "stock": 25,
        "type": ProductType.plant,
        "sunlight": Sunlight.partial_shade,
        "smell": Smell.none,
        "environment": Environment.indoor,
        "water_requirement": "Water weekly when top soil dries slightly.",
        "care_notes": "Prefers bright indirect light.",
        "kit_available": True,
        "service_available": True,
        "popularity_score": Decimal("98.00"),
        "is_active": True,
    },
    {
        "id": 2,
        "name": "Snake Plant Laurentii",
        "description": "Low-maintenance indoor plant that tolerates neglect.",
        "price": Decimal("899.00"),
        "stock": 40,
        "type": ProductType.plant,
        "sunlight": Sunlight.partial_shade,
        "smell": Smell.none,
        "environment": Environment.indoor,
        "water_requirement": "Water every 2 to 3 weeks.",
        "care_notes": "Great for beginners and bedrooms.",
        "kit_available": True,
        "service_available": False,
        "popularity_score": Decimal("94.00"),
        "is_active": True,
    },
    {
        "id": 3,
        "name": "Lavender Seeds",
        "description": "Fragrant heirloom lavender seeds for sunny spaces.",
        "price": Decimal("249.00"),
        "stock": 100,
        "type": ProductType.seed,
        "sunlight": Sunlight.full_sun,
        "smell": Smell.strong,
        "environment": Environment.outdoor,
        "water_requirement": "Keep soil moist until germination.",
        "care_notes": "Needs at least 6 hours of sunlight.",
        "kit_available": False,
        "service_available": False,
        "popularity_score": Decimal("82.00"),
        "is_active": True,
    },
    {
        "id": 4,
        "name": "Bloom Boost Organic",
        "description": "Organic fertilizer for lush growth and vibrant blooms.",
        "price": Decimal("499.00"),
        "stock": 60,
        "type": ProductType.accessory,
        "sunlight": Sunlight.partial_shade,
        "smell": Smell.light,
        "environment": Environment.both,
        "water_requirement": "Use as directed with regular watering.",
        "care_notes": "Apply every 2 weeks in growing season.",
        "kit_available": False,
        "service_available": False,
        "popularity_score": Decimal("76.00"),
        "is_active": True,
    },
]


async def seed() -> None:
    async with SessionLocal() as db:
        existing = await db.execute(select(Product.name))
        existing_names = set(existing.scalars().all())

        created = 0
        for row in SEED_PRODUCTS:
            if row["name"] in existing_names:
                continue
            db.add(Product(**row))
            created += 1

        await db.commit()
        print(f"Seed complete. Added {created} products.")


if __name__ == "__main__":
    asyncio.run(seed())
