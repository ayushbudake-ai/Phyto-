"""Initial schema

Revision ID: 87057a4a0598
Revises: 
Create Date: 2026-04-23 13:49:11.961001

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '87057a4a0598'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.dialects import mysql

def upgrade() -> None:
    # users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('firebase_uid', sa.String(length=128), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('role', sa.Enum('customer', 'nursery', 'delivery', 'admin', name='userrole'), nullable=True),
        sa.Column('address_street', sa.String(length=255), nullable=True),
        sa.Column('address_city', sa.String(length=100), nullable=True),
        sa.Column('address_state', sa.String(length=100), nullable=True),
        sa.Column('address_zip', sa.String(length=20), nullable=True),
        sa.Column('profile_image_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_firebase_uid'), 'users', ['firebase_uid'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # categories
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=True),
        sa.Column('slug', sa.String(length=100), nullable=True),
        sa.Column('icon_url', sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name'),
        sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)

    # products
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nursery_id', sa.Integer(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(length=255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('stock', sa.Integer(), nullable=True),
        sa.Column('type', sa.Enum('plant', 'seed', 'tool', 'accessory', name='producttype'), nullable=True),
        sa.Column('sunlight', sa.Enum('full_sun', 'partial_shade', 'full_shade', name='sunlight'), nullable=True),
        sa.Column('smell', sa.Enum('none', 'light', 'strong', name='smell'), nullable=True),
        sa.Column('environment', sa.Enum('indoor', 'outdoor', 'both', name='environment'), nullable=True),
        sa.Column('water_requirement', sa.String(length=255), nullable=True),
        sa.Column('care_notes', sa.Text(), nullable=True),
        sa.Column('kit_available', sa.Boolean(), nullable=True),
        sa.Column('service_available', sa.Boolean(), nullable=True),
        sa.Column('popularity_score', sa.DECIMAL(precision=5, scale=2), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
        sa.ForeignKeyConstraint(['nursery_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_products_id'), 'products', ['id'], unique=False)
    op.create_index(op.f('ix_products_name'), 'products', ['name'], unique=False)
    op.create_index('idx_product_fulltext', 'products', ['name', 'description'], mysql_prefix='FULLTEXT')

    # product_images
    op.create_table(
        'product_images',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_images_id'), 'product_images', ['id'], unique=False)

    # product_tags
    op.create_table(
        'product_tags',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('tag', sa.String(length=100), nullable=True),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_product_tags_id'), 'product_tags', ['id'], unique=False)

    # carts
    op.create_table(
        'carts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_carts_id'), 'carts', ['id'], unique=False)

    # cart_items
    op.create_table(
        'cart_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('cart_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('include_kit', sa.Boolean(), nullable=True),
        sa.Column('include_service', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['cart_id'], ['carts.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cart_items_id'), 'cart_items', ['id'], unique=False)

    # orders
    op.create_table(
        'orders',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('nursery_id', sa.Integer(), nullable=True),
        sa.Column('delivery_partner_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', name='orderstatus'), nullable=True),
        sa.Column('total_amount', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('payment_method', sa.Enum('cod', 'online', name='paymentmethod'), nullable=True),
        sa.Column('payment_status', sa.Enum('pending', 'completed', 'failed', 'refunded', name='paymentstatus'), nullable=True),
        sa.Column('shipping_name', sa.String(length=255), nullable=True),
        sa.Column('shipping_street', sa.String(length=255), nullable=True),
        sa.Column('shipping_city', sa.String(length=100), nullable=True),
        sa.Column('shipping_pincode', sa.String(length=20), nullable=True),
        sa.Column('shipping_phone', sa.String(length=50), nullable=True),
        sa.Column('firebase_rtdb_key', sa.String(length=255), nullable=True),
        sa.Column('placed_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['delivery_partner_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['nursery_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)

    # order_items
    op.create_table(
        'order_items',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('order_id', sa.Integer(), nullable=True),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('product_name', sa.String(length=255), nullable=True),
        sa.Column('unit_price', sa.DECIMAL(precision=10, scale=2), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('include_kit', sa.Boolean(), nullable=True),
        sa.Column('include_service', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_order_items_id'), 'order_items', ['id'], unique=False)

    # reviews
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('product_id', sa.Integer(), nullable=True),
        sa.Column('customer_id', sa.Integer(), nullable=True),
        sa.Column('order_id', sa.Integer(), nullable=True),
        sa.Column('rating', mysql.TINYINT(), nullable=True),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ),
        sa.ForeignKeyConstraint(['product_id'], ['products.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)

def downgrade() -> None:
    op.drop_table('reviews')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('cart_items')
    op.drop_table('carts')
    op.drop_table('product_tags')
    op.drop_table('product_images')
    op.drop_table('products')
    op.drop_table('categories')
    op.drop_table('users')
