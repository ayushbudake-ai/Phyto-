import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_recommendation_scoring_engine(async_client: AsyncClient, sample_products: list):
    # 1. Quick recommendation for indoor + low maintenance
    rec_payload = {
        "environment": "indoor",
        "maintenance": "low",
        "sunlight": "partial_shade",
        "limit": 5,
    }
    res = await async_client.post("/chatbot/recommend", json=rec_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_scored"] >= 1
    assert len(data["recommendations"]) >= 1
    # Monstera has low_maintenance tag + partial_shade + indoor
    top_product = data["recommendations"][0]
    assert top_product["name"] == "Monstera Deliciosa"
    assert "match_score" in top_product
    assert top_product["match_score"] > 0
    assert any(
        "Easy to care for" in r or "Matches your light" in r or "Perfect for indoor" in r
        for r in top_product["match_reasons"]
    )

    # 2. Recommendation for pet friendly
    pet_payload = {
        "pet_friendly": True,
        "environment": "indoor",
    }
    pet_res = await async_client.post("/chatbot/recommend", json=pet_payload)
    assert pet_res.status_code == 200
    pet_data = pet_res.json()
    assert pet_data["total_scored"] >= 1
    # Peace Lily has pet_friendly tag
    top_pet = pet_data["recommendations"][0]
    assert top_pet["name"] == "Peace Lily"
    assert "Safe for pets" in top_pet["match_reasons"]
