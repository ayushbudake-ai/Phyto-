import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_and_login_flow(async_client: AsyncClient):
    # 1. Register a new user
    reg_payload = {
        "email": "newuser@example.com",
        "password": "securepassword123",
        "name": "New User",
        "phone": "9998887776",
        "role": "customer",
    }
    reg_res = await async_client.post("/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newuser@example.com"
    assert data["user"]["name"] == "New User"
    assert data["user"]["role"] == "customer"

    # 2. Duplicate registration should fail
    dup_res = await async_client.post("/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login with correct credentials
    login_payload = {
        "email": "newuser@example.com",
        "password": "securepassword123",
    }
    login_res = await async_client.post("/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    token = login_data["access_token"]

    # 4. Login with wrong password
    bad_login = await async_client.post("/auth/login", json={"email": "newuser@example.com", "password": "wrongpassword"})
    assert bad_login.status_code == 401

    # 5. Access /auth/me with token
    me_res = await async_client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "newuser@example.com"

    # 6. Access /auth/me without token
    unauth_res = await async_client.get("/auth/me")
    assert unauth_res.status_code == 401
