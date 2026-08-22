import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_order_creation_and_lifecycle(
    async_client: AsyncClient,
    auth_headers: dict,
    admin_headers: dict,
    sample_products: list,
):
    p1 = sample_products[0]

    # 1. Add item to cart first
    await async_client.post(
        "/cart/items",
        json={"product_id": p1.id, "quantity": 2, "include_kit": True},
        headers=auth_headers,
    )

    # 2. Place order from cart
    order_payload = {
        "shipping_name": "Test Customer",
        "shipping_street": "123 Green Lane",
        "shipping_city": "Bangalore",
        "shipping_pincode": "560001",
        "shipping_phone": "9876543210",
        "payment_method": "cod",
    }
    order_res = await async_client.post("/orders", json=order_payload, headers=auth_headers)
    assert order_res.status_code == 201
    order = order_res.json()
    assert order["status"] == "pending"
    assert order["payment_status"] == "pending"
    assert order["total_amount"] == 799.0 * 2
    assert len(order["items"]) == 1
    assert order["items"][0]["quantity"] == 2
    order_id = order["id"]

    # 3. Cart should now be empty
    cart = (await async_client.get("/cart", headers=auth_headers)).json()
    assert cart["total_items"] == 0

    # 4. Customer views their orders
    cust_orders_res = await async_client.get("/orders", headers=auth_headers)
    assert cust_orders_res.status_code == 200
    assert cust_orders_res.json()["total"] >= 1

    # 5. Admin updates order status to confirmed -> shipped -> delivered
    status_res = await async_client.patch(
        f"/orders/{order_id}/status",
        json={"status": "confirmed"},
        headers=admin_headers,
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "confirmed"

    ship_res = await async_client.patch(
        f"/orders/{order_id}/status",
        json={"status": "shipped"},
        headers=admin_headers,
    )
    assert ship_res.status_code == 200
    assert ship_res.json()["status"] == "shipped"

    deliv_res = await async_client.patch(
        f"/orders/{order_id}/status",
        json={"status": "delivered"},
        headers=admin_headers,
    )
    assert deliv_res.status_code == 200
    assert deliv_res.json()["status"] == "delivered"
    # COD delivered order should mark payment completed
    assert deliv_res.json()["payment_status"] == "completed"
