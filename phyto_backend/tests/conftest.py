import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.main import app
from app.auth_utils import get_db, create_access_token
from app.models.all_models import (
    User,
    UserRole,
    Product,
    ProductType,
    Sunlight,
    Environment,
    Smell,
    ProductTag,
    Category,
)

# In-memory SQLite for testing
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = async_sessionmaker(
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    bind=test_engine,
)


async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(scope="function", autouse=True)
async def prepare_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session


@pytest_asyncio.fixture
async def async_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession):
    from app.auth_utils import get_password_hash

    user = User(
        name="Test Customer",
        email="customer@example.com",
        password_hash=get_password_hash("password123"),
        role=UserRole.customer,
        phone="9876543210",
        address_street="123 Green Lane",
        address_city="Bangalore",
        address_state="Karnataka",
        address_zip="560001",
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(db_session: AsyncSession):
    from app.auth_utils import get_password_hash

    user = User(
        name="Test Admin",
        email="admin@example.com",
        password_hash=get_password_hash("admin123"),
        role=UserRole.admin,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def nursery_user(db_session: AsyncSession):
    from app.auth_utils import get_password_hash

    user = User(
        name="Test Nursery",
        email="nursery@example.com",
        password_hash=get_password_hash("nursery123"),
        role=UserRole.nursery,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
def auth_headers(test_user: User):
    token = create_access_token(user_id=test_user.id, role=test_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
def admin_headers(admin_user: User):
    token = create_access_token(user_id=admin_user.id, role=admin_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
def nursery_headers(nursery_user: User):
    token = create_access_token(user_id=nursery_user.id, role=nursery_user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def sample_products(db_session: AsyncSession, nursery_user: User):
    cat = Category(name="Indoor Plants", slug="indoor-plants")
    db_session.add(cat)
    await db_session.flush()

    p1 = Product(
        name="Monstera Deliciosa",
        description="Famous Swiss cheese plant",
        price=799.00,
        stock=15,
        type=ProductType.plant,
        sunlight=Sunlight.partial_shade,
        smell=Smell.none,
        environment=Environment.indoor,
        water_requirement="Weekly",
        care_notes="Keep leaves dusted",
        kit_available=True,
        service_available=True,
        popularity_score=85.0,
        is_active=True,
        category_id=cat.id,
        nursery_id=nursery_user.id,
    )
    db_session.add(p1)
    await db_session.flush()

    tag1 = ProductTag(product_id=p1.id, tag="low_maintenance")
    tag2 = ProductTag(product_id=p1.id, tag="air_purifying")
    db_session.add(tag1)
    db_session.add(tag2)

    p2 = Product(
        name="Peace Lily",
        description="Air purifying blooming plant",
        price=499.00,
        stock=20,
        type=ProductType.plant,
        sunlight=Sunlight.full_shade,
        smell=Smell.light,
        environment=Environment.indoor,
        water_requirement="Twice weekly",
        care_notes="Droops when thirsty",
        kit_available=False,
        popularity_score=90.0,
        is_active=True,
        category_id=cat.id,
        nursery_id=nursery_user.id,
    )
    db_session.add(p2)
    await db_session.flush()

    tag3 = ProductTag(product_id=p2.id, tag="air_purifying")
    tag4 = ProductTag(product_id=p2.id, tag="pet_friendly")
    db_session.add(tag3)
    db_session.add(tag4)

    await db_session.commit()
    return [p1, p2]
