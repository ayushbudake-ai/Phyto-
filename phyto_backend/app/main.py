import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import select, func

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models.all_models import Product, User, UserRole
from app.auth_utils import get_password_hash
from app.mongodb import create_mongo_client, get_phyto_db
from app.routers import auth, users, products, orders, cart, nursery, chatbot


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is created
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo data if database is empty
    async with SessionLocal() as db:
        res = await db.execute(select(func.count(Product.id)))
        count = res.scalar_one_or_none() or 0
        if count == 0:
            try:
                from seed_demo_products import SEED_PRODUCTS
                for row in SEED_PRODUCTS:
                    db.add(Product(**row))
                # Seed demo users
                admin_user = User(
                    name="Green Thumbs Nursery",
                    email="nursery@phyto.com",
                    password_hash=get_password_hash("password123"),
                    role=UserRole.nursery,
                )
                customer_user = User(
                    name="Priya Sharma",
                    email="customer@phyto.com",
                    password_hash=get_password_hash("password123"),
                    role=UserRole.customer,
                )
                db.add(admin_user)
                db.add(customer_user)
                await db.commit()
            except Exception:
                pass

    # Setup Mongo if configured
    mongo_client = create_mongo_client()
    if mongo_client:
        app.state.mongo_client = mongo_client
        app.state.mongo_db = get_phyto_db(mongo_client)
    yield
    if mongo_client:
        mongo_client.close()


app = FastAPI(title="Phyto API", lifespan=lifespan)

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads directory to serve static image files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(orders.router, prefix="/orders", tags=["orders"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(nursery.router, prefix="/nursery", tags=["nursery"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["chatbot"])


@app.get("/")
def read_root():
    return {"message": "Welcome to Phyto API", "status": "running", "version": "1.0.0"}