from __future__ import annotations

import httpx


async def fetch_plant_details_from_trefle(*, token: str, query: str) -> dict[str, str | None] | None:
    if not token or not query:
        return None

    params = {"token": token, "q": query}
    url = "https://trefle.io/api/v1/plants/search"

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            payload = response.json()
    except Exception:
        return None

    rows = payload.get("data") if isinstance(payload, dict) else None
    if not isinstance(rows, list) or not rows:
        return None

    first = rows[0] if isinstance(rows[0], dict) else {}
    main = first.get("main_species") if isinstance(first.get("main_species"), dict) else {}
    growth = main.get("growth") if isinstance(main.get("growth"), dict) else {}

    sunlight = first.get("growth") if isinstance(first.get("growth"), str) else None
    if sunlight is None and isinstance(main.get("growth"), dict):
        light = main["growth"].get("light")
        sunlight = str(light) if light is not None else None

    soil_data = main.get("soil")
    soil_type = ", ".join(str(v) for v in soil_data if v is not None) if isinstance(soil_data, list) else None

    humidity_data = growth.get("atmospheric_humidity")
    humidity = str(humidity_data) if humidity_data is not None else None

    image_url = first.get("image_url") if isinstance(first.get("image_url"), str) else None

    if not any([sunlight, soil_type, humidity, image_url]):
        return None

    return {"sunlight": sunlight, "soil_type": soil_type, "humidity": humidity, "image_url": image_url}


async def fetch_plant_specs_from_trefle(*, token: str, query: str) -> dict[str, str | None] | None:
    details = await fetch_plant_details_from_trefle(token=token, query=query)
    if not details:
        return None
    return {
        "sunlight": details.get("sunlight"),
        "soil_type": details.get("soil_type"),
        "humidity": details.get("humidity"),
    }
