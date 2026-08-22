import pytest
from httpx import AsyncClient
from app.models.all_models import User


@pytest.mark.asyncio
async def test_users_and_nursery_endpoints(
    async_client: AsyncClient,
    test_user: User,
    auth_headers: dict,
    admin_headers: dict,
    nursery_headers: dict,
    sample_products: list,
):
    # 1. User profile update
    update_res = await async_client.put(
        "/users/me",
        json={"name": "Updated Customer Name", "phone": "1122334455"},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Updated Customer Name"
    assert update_res.json()["phone"] == "1122334455"

    # 2. Admin list users
    list_users_res = await async_client.get("/users", headers=admin_headers)
    assert list_users_res.status_code == 200
    assert len(list_users_res.json()) >= 3

    # 3. Non-admin forbidden from listing users
    forbidden_users = await async_client.get("/users", headers=auth_headers)
    assert forbidden_users.status_code == 403

    # 4. Nursery dashboard
    dash_res = await async_client.get("/nursery/dashboard", headers=nursery_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "total_products" in dash_data
    assert "low_stock_products" in dash_data
    assert dash_data["total_products"] == 2

    # 5. Nursery product list
    nursery_prods_res = await async_client.get("/nursery/products", headers=nursery_headers)
    assert nursery_prods_res.status_code == 200
    assert len(nursery_prods_res.json()) == 2
