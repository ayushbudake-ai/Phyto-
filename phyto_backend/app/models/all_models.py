from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    Enum,
    Boolean,
    DECIMAL,
    Text,
    DateTime,
    Index,
    SmallInteger,
)
from sqlalchemy.orm import relationship
import enum
from datetime import datetime
from app.database import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    nursery = "nursery"
    delivery = "delivery"
    admin = "admin"


class ProductType(str, enum.Enum):
    plant = "plant"
    seed = "seed"
    tool = "tool"
    accessory = "accessory"


class Sunlight(str, enum.Enum):
    full_sun = "full_sun"
    partial_shade = "partial_shade"
    full_shade = "full_shade"


class Smell(str, enum.Enum):
    none = "none"
    light = "light"
    strong = "strong"


class Environment(str, enum.Enum):
    indoor = "indoor"
    outdoor = "outdoor"
    both = "both"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    shipped = "shipped"
    delivered = "delivered"
    cancelled = "cancelled"


class PaymentMethod(str, enum.Enum):
    cod = "cod"
    online = "online"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    firebase_uid = Column(String(128), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    address_street = Column(String(255), nullable=True)
    address_city = Column(String(100), nullable=True)
    address_state = Column(String(100), nullable=True)
    address_zip = Column(String(20), nullable=True)
    profile_image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    orders = relationship("Order", foreign_keys="[Order.customer_id]", back_populates="customer", cascade="all, delete-orphan")
    cart = relationship("Cart", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reviews = relationship("Review", foreign_keys="[Review.customer_id]", back_populates="customer")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    icon_url = Column(String(500), nullable=True)

    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    nursery_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(DECIMAL(10, 2), nullable=False, default=0.0)
    stock = Column(Integer, default=0)
    type = Column(Enum(ProductType), default=ProductType.plant)
    sunlight = Column(Enum(Sunlight), nullable=True)
    smell = Column(Enum(Smell), nullable=True)
    environment = Column(Enum(Environment), nullable=True)
    water_requirement = Column(String(255), nullable=True)
    care_notes = Column(Text, nullable=True)
    kit_available = Column(Boolean, default=False)
    service_available = Column(Boolean, default=False)
    popularity_score = Column(DECIMAL(5, 2), default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_product_fulltext", "name", "description", mysql_prefix="FULLTEXT"),
    )

    # Relationships
    category = relationship("Category", back_populates="products")
    nursery = relationship("User", foreign_keys=[nursery_id])
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", lazy="selectin")
    tags = relationship("ProductTag", back_populates="product", cascade="all, delete-orphan", lazy="selectin")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan", lazy="selectin")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    product = relationship("Product", back_populates="images")


class ProductTag(Base):
    __tablename__ = "product_tags"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    tag = Column(String(100), nullable=False)

    product = relationship("Product", back_populates="tags")


class Cart(Base):
    __tablename__ = "carts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="cart")
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan", lazy="selectin")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    include_kit = Column(Boolean, default=False)
    include_service = Column(Boolean, default=False)

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", lazy="joined")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    nursery_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    delivery_partner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.pending)
    total_amount = Column(DECIMAL(10, 2), nullable=False, default=0.0)
    payment_method = Column(Enum(PaymentMethod), default=PaymentMethod.cod)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)
    shipping_name = Column(String(255), nullable=True)
    shipping_street = Column(String(255), nullable=True)
    shipping_city = Column(String(100), nullable=True)
    shipping_pincode = Column(String(20), nullable=True)
    shipping_phone = Column(String(50), nullable=True)
    firebase_rtdb_key = Column(String(255), nullable=True)
    placed_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    customer = relationship("User", foreign_keys=[customer_id], back_populates="orders")
    nursery = relationship("User", foreign_keys=[nursery_id])
    delivery_partner = relationship("User", foreign_keys=[delivery_partner_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    reviews = relationship("Review", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String(255), nullable=False)
    unit_price = Column(DECIMAL(10, 2), nullable=False, default=0.0)
    quantity = Column(Integer, default=1)
    include_kit = Column(Boolean, default=False)
    include_service = Column(Boolean, default=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product", lazy="joined")


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    rating = Column(SmallInteger, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="reviews")
    customer = relationship("User", foreign_keys=[customer_id], back_populates="reviews")
    order = relationship("Order", foreign_keys=[order_id], back_populates="reviews")
