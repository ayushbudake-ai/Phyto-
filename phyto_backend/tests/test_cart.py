import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_cart_operations(async_client: AsyncClient, auth_headers: dict, sample_products: list):
    p1 = sample_products[0]
    p2 = sample_products[1]

    # 1. Initial cart is empty
    cart_res = await async_client.get("/cart", headers=auth_headers)
    assert cart_res.status_code == 200
    cart = cart_res.json()
    assert cart["total_items"] == 0
    assert len(cart["items"]) == 0

    # 2. Add item to cart
    add_res = await async_client.post(
        "/cart/items",
        json={"product_id": p1.id, "quantity": 2, "include_kit": True},
        headers=auth_headers,
    )
    assert add_res.status_code == 200
    cart = add_res.json()
    assert cart["total_items"] == 2
    assert len(cart["items"]) == 1
    assert cart["items"][0]["include_kit"] is True
    item_id = cart["items"][0]["id"]

    # 3. Add second product
    await async_client.post(
        "/cart/items",
        json={"product_id": p2.id, "quantity": 1},
        headers=auth_headers,
    )
    cart = (await async_client.get("/cart", headers=auth_headers)).json()
    assert cart["total_items"] == 3
    assert len(cart["items"]) == 2

    # 4. Update cart item quantity
    patch_res = await async_client.patch(
        f"/cart/items/{item_id}",
        json={"quantity": 5},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    cart = patch_res.json()
    assert cart["total_items"] == 6

    # 5. Remove single item
    del_item_res = await async_client.delete(f"/cart/items/{item_id}", headers=auth_headers)
    assert del_item_res.status_code == 200
    cart = del_item_res.json()
    assert cart["total_items"] == 1

    # 6. Clear cart
    clear_res = await async_client.delete("/cart", headers=auth_headers)
    assert clear_res.status_code == 200
    cart = clear_res.json()
    assert cart["total_items"] == 0
