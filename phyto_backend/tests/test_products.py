import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_products_and_filters(async_client: AsyncClient, sample_products: list):
    # 1. List all products
    res = await async_client.get("/products")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2

    # 2. Filter by sunlight
    res_sun = await async_client.get("/products?sunlight=partial_shade")
    assert res_sun.status_code == 200
    sun_data = res_sun.json()
    assert sun_data["total"] == 1
    assert sun_data["items"][0]["name"] == "Monstera Deliciosa"

    # 3. Filter by tag
    res_tag = await async_client.get("/products?tag=pet_friendly")
    assert res_tag.status_code == 200
    tag_data = res_tag.json()
    assert tag_data["total"] == 1
    assert tag_data["items"][0]["name"] == "Peace Lily"

    # 4. Search query q
    res_q = await async_client.get("/products?q=Monstera")
    assert res_q.status_code == 200
    q_data = res_q.json()
    assert q_data["total"] == 1
    assert q_data["items"][0]["name"] == "Monstera Deliciosa"

    # 5. Price filter
    res_price = await async_client.get("/products?price_max=500")
    assert res_price.status_code == 200
    price_data = res_price.json()
    assert price_data["total"] == 1
    assert price_data["items"][0]["name"] == "Peace Lily"


@pytest.mark.asyncio
async def test_product_crud_admin(async_client: AsyncClient, admin_headers: dict):
    # Create product
    create_payload = {
        "name": "Snake Plant",
        "description": "Indestructible hardy houseplant",
        "price": 350.0,
        "stock": 30,
        "type": "plant",
        "sunlight": "full_shade",
        "environment": "indoor",
        "water_requirement": "Bi-weekly",
        "kit_available": True,
        "tags": ["low_maintenance", "air_purifying", "hardy"],
    }
    create_res = await async_client.post("/products", json=create_payload, headers=admin_headers)
    assert create_res.status_code == 201
    prod = create_res.json()
    prod_id = prod["id"]
    assert prod["name"] == "Snake Plant"
    assert len(prod["tags"]) == 3

    # Get product detail
    get_res = await async_client.get(f"/products/{prod_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Snake Plant"

    # Update product
    update_payload = {
        "price": 399.0,
        "stock": 25,
    }
    update_res = await async_client.put(f"/products/{prod_id}", json=update_payload, headers=admin_headers)
    assert update_res.status_code == 200
    assert update_res.json()["price"] == 399.0
    assert update_res.json()["stock"] == 25

    # Delete product
    del_res = await async_client.delete(f"/products/{prod_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Verify deleted
    not_found = await async_client.get(f"/products/{prod_id}")
    assert not_found.status_code == 404
