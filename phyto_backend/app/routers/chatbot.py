# phyto_backend/app/routers/chatbot.py
# ─────────────────────────────────────────────────────────────
# Phyto Chatbot + Algorithm-Based Recommendation Engine
#
# HOW TO ADD TO PROJECT:
#   1. Save this file as:  phyto_backend/app/routers/chatbot.py
#   2. In main.py add:
#       from app.routers import chatbot
#       app.include_router(chatbot.router, prefix='/chatbot', tags=['chatbot'])
#   3. Add to .env:
#       ANTHROPIC_API_KEY=your_key_here
#   4. pip install anthropic
# ─────────────────────────────────────────────────────────────

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
from typing import Optional
import httpx
import json

from app.models.all_models import Product, User
from app.config import settings
from app.auth_utils import get_db

router = APIRouter()


# ══════════════════════════════════════════════════════════════
#  PYDANTIC SCHEMAS
# ══════════════════════════════════════════════════════════════

class ChatMessage(BaseModel):
    role: str          # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    user_id: Optional[int] = None   # for personalized recommendations

class RecommendRequest(BaseModel):
    sunlight: Optional[str] = None       # "full_sun" | "partial" | "shade"
    environment: Optional[str] = None    # "indoor" | "outdoor" | "both"
    maintenance: Optional[str] = None    # "low" | "medium" | "high"
    pet_friendly: Optional[bool] = None
    budget_max: Optional[float] = None
    tags: Optional[list[str]] = None
    limit: int = 6


# ══════════════════════════════════════════════════════════════
#  ALGORITHM-BASED RECOMMENDATION ENGINE
#  Pure SQL scoring — no ML, no external service needed
#  Score = sum of matching attributes × weights
# ══════════════════════════════════════════════════════════════

SCORE_WEIGHTS = {
    "sunlight_match":     30,   # exact sunlight match
    "environment_match":  25,   # indoor/outdoor match
    "budget_ok":          20,   # within budget
    "pet_friendly":       15,   # pet friendly tag
    "low_maintenance":    15,   # low maintenance tag
    "tag_match":          10,   # each matching tag
    "popularity_bonus":    5,   # per 10 popularity points (capped at 50)
    "in_stock":           10,   # has stock > 0
}

async def score_and_rank_products(
    db: AsyncSession,
    request: RecommendRequest,
    request_obj: Request,
) -> list[dict]:
    """
    Pure algorithm-based recommendation.
    Fetches all active products, scores each one, returns top N.
    """
    result = await db.execute(
        select(Product)
        .options(selectinload(Product.tags), selectinload(Product.images))
        .where(Product.is_active.is_(True))
        .limit(200)  # noqa
    )
    products = result.scalars().all()

    scored = []
    for p in products:
        score = 0
        reasons = []

        # ── Sunlight match ─────────────────────────────────
        if request.sunlight and p.sunlight:
            p_sun = p.sunlight.value if hasattr(p.sunlight, 'value') else str(p.sunlight)
            if p_sun == request.sunlight:
                score += SCORE_WEIGHTS["sunlight_match"]
                reasons.append("Matches your light conditions")

        # ── Environment match ──────────────────────────────
        if request.environment and p.environment:
            p_env = p.environment.value if hasattr(p.environment, 'value') else str(p.environment)
            if p_env == request.environment or p_env == "both":
                score += SCORE_WEIGHTS["environment_match"]
                reasons.append(f"Perfect for {request.environment}")

        # ── Budget ─────────────────────────────────────────
        if request.budget_max and p.price:
            if float(p.price) <= request.budget_max:
                score += SCORE_WEIGHTS["budget_ok"]
                reasons.append(f"Within your budget of ₹{request.budget_max:.0f}")

        # ── Pet friendly ───────────────────────────────────
        if request.pet_friendly and p.tags:
            tag_vals = [t.tag.value if hasattr(t.tag, 'value') else str(t.tag) for t in p.tags] if hasattr(p, 'tags') else []
            if "pet_friendly" in tag_vals:
                score += SCORE_WEIGHTS["pet_friendly"]
                reasons.append("Safe for pets")

        # ── Low maintenance ────────────────────────────────
        if request.maintenance == "low":
            tag_vals = [t.tag.value if hasattr(t.tag, 'value') else str(t.tag) for t in p.tags] if hasattr(p, 'tags') else []
            if "low_maintenance" in tag_vals:
                score += SCORE_WEIGHTS["low_maintenance"]
                reasons.append("Easy to care for")

        # ── Extra tag matches ──────────────────────────────
        if request.tags:
            tag_vals = [t.tag.value if hasattr(t.tag, 'value') else str(t.tag) for t in p.tags] if hasattr(p, 'tags') else []
            for tag in request.tags:
                if tag in tag_vals:
                    score += SCORE_WEIGHTS["tag_match"]
                    reasons.append(f"Tagged: {tag.replace('_', ' ')}")

        # ── Popularity bonus (capped) ──────────────────────
        if p.popularity_score:
            pop_bonus = min(int(p.popularity_score / 10) * SCORE_WEIGHTS["popularity_bonus"], 50)
            score += pop_bonus

        # ── In stock ──────────────────────────────────────
        if p.stock and p.stock > 0:
            score += SCORE_WEIGHTS["in_stock"]

        # ── Resolve image ──────────────────────────────────
        img_url = None
        mongo_db = getattr(request_obj.app.state, "mongo_db", None)
        if mongo_db:
            doc = await mongo_db["product_media"].find_one(
                {"product_id": p.id, "is_primary": True}, {"_id": 0}
            )
            if doc:
                img_url = doc.get("url")

        if not img_url and p.images:
            for img in p.images:
                if img.is_primary:
                    img_url = img.image_url
                    break
            if not img_url and len(p.images) > 0:
                img_url = p.images[0].image_url

        scored.append({
            "id": p.id,
            "name": p.name,
            "price": float(p.price) if p.price else 0,
            "image_url": img_url,
            "type": p.type.value if hasattr(p.type, 'value') else str(p.type),
            "environment": p.environment.value if hasattr(p.environment, 'value') else str(p.environment),
            "sunlight": p.sunlight.value if hasattr(p.sunlight, 'value') else str(p.sunlight),
            "kit_available": bool(p.kit_available),
            "popularity": float(p.popularity_score or 0),
            "_score": score,
            "_reasons": list(set(reasons)),  # deduplicate
        })

    # Sort by score desc, then popularity desc
    scored.sort(key=lambda x: (-x["_score"], -x["popularity"]))

    # Return top N with score metadata
    top = scored[:request.limit]
    for item in top:
        item["match_score"] = item.pop("_score")
        item["match_reasons"] = item.pop("_reasons")

    return top


# ══════════════════════════════════════════════════════════════
#  CHATBOT ENGINE
#  Uses Anthropic API with plant knowledge injected into system prompt
# ══════════════════════════════════════════════════════════════

PHYTO_SYSTEM_PROMPT = """You are Phyto's friendly plant expert assistant named "Phyto Bot".
You help customers of Phyto — an Indian online plant store — find the right plants, 
seeds, fertilizers, and gardening tools. 

PERSONALITY: Warm, knowledgeable, encouraging. Like a helpful friend who knows a lot about plants.

CURRENCY: Always use ₹ (Indian Rupees) for prices. Never use $.

WHAT YOU CAN HELP WITH:
- Recommending plants based on user's space (indoor/outdoor), light, pets, budget
- Plant care advice (watering, sunlight, soil, repotting)
- Identifying plants from descriptions
- Troubleshooting plant problems (yellowing leaves, root rot, pests)
- Gardening tips for Indian climate and seasons
- Explaining product categories (seeds, fertilizers, tools)
- Helping users navigate the Phyto shop

RECOMMENDATION FORMAT:
When recommending plants, suggest 2-3 specific ones with:
- Name
- Why it suits them
- Quick care tip
- Approximate price range in ₹

KEEP RESPONSES:
- Concise (2-4 sentences for simple questions, up to 6 for complex ones)
- Friendly and encouraging
- Practical for Indian conditions
- Always suggest exploring the Phyto shop for purchases

If asked something completely unrelated to plants/gardening/nature, politely redirect.
"""

async def call_anthropic_api(
    message: str,
    history: list[ChatMessage],
    product_context: str = "",
) -> str:
    """Call Anthropic API directly via httpx (no SDK needed)."""
    api_key = getattr(settings, 'ANTHROPIC_API_KEY', None)
    if not api_key:
        # Fallback: rule-based responses if no API key
        return rule_based_response(message)

    system = PHYTO_SYSTEM_PROMPT
    if product_context:
        system += f"\n\nCURRENT SHOP CONTEXT:\n{product_context}"

    messages = []
    for h in history[-6:]:  # keep last 6 turns only
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": message})

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-haiku-4-5-20251001",  # fast + cheap for chat
                    "max_tokens": 400,
                    "system": system,
                    "messages": messages,
                }
            )
            data = resp.json()
            return data["content"][0]["text"]
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again! ({str(e)[:50]})"


def rule_based_response(message: str) -> str:
    """
    Fallback rule-based chatbot when no Anthropic API key is set.
    Handles common plant queries without any API.
    """
    msg = message.lower()

    if any(w in msg for w in ["hello", "hi", "hey", "namaste"]):
        return "Namaste! 🌿 I'm Phyto Bot, your plant expert. Ask me anything about plants, care tips, or finding the right plant for your home!"

    if any(w in msg for w in ["water", "watering", "pani"]):
        return "Most indoor plants need watering once a week. Check the top 1-2 inches of soil — if it's dry, it's time to water. Overwatering is the #1 cause of plant problems!"

    if any(w in msg for w in ["sunlight", "light", "dhoop", "window"]):
        return "Most indoor plants prefer bright indirect light near a window. Direct afternoon sun can scorch leaves. Plants like Snake Plant and Pothos can handle low light well."

    if any(w in msg for w in ["beginner", "easy", "simple", "first plant", "shuru"]):
        return "For beginners, I recommend: 🌱 Snake Plant (very forgiving), 🪴 Pothos/Money Plant (grows anywhere), or 🌿 Tulsi (great for Indian homes). All available in our shop!"

    if any(w in msg for w in ["pet", "cat", "dog", "billi", "kutta"]):
        return "Great question! Pet-safe plants include: Spider Plant, Areca Palm, Boston Fern, and Tulsi. Avoid Peace Lily, Pothos, and ZZ Plant around pets. Filter by 'Pet Friendly' in our shop!"

    if any(w in msg for w in ["yellow", "yellowing", "peela"]):
        return "Yellow leaves usually mean overwatering! Let the soil dry out between waterings. It can also be too little light or lack of nutrients — try a balanced fertilizer."

    if any(w in msg for w in ["fertilizer", "khad", "nutrients", "feed"]):
        return "Feed indoor plants every 2-4 weeks during summer (March-September) with a balanced NPK fertilizer. Reduce to once a month in winter. Don't fertilize freshly repotted plants!"

    if any(w in msg for w in ["monstera", "swiss cheese"]):
        return "Monstera Deliciosa is iconic! 🍃 It needs bright indirect light, weekly watering, and high humidity. Perfect for living rooms. Available at Phyto for ₹599!"

    if any(w in msg for w in ["recommend", "suggest", "which plant", "kaunsa"]):
        return "I'd love to help you find the perfect plant! Tell me: 1) Where will it go (indoor/outdoor)? 2) How much light does that spot get? 3) Do you have pets? 4) Your budget?"

    if any(w in msg for w in ["price", "cost", "kitna", "rate", "cheap"]):
        return "Phyto has plants starting from ₹79 (Tulsi seeds) to ₹1299 (Fiddle Leaf Fig). Use the Price Range filter in our shop to find plants within your budget!"

    return "That's a great plant question! 🌿 I'm best at helping with plant care, recommendations, and identifying the right plants for your space. What would you like to know?"


# ══════════════════════════════════════════════════════════════
#  API ENDPOINTS
# ══════════════════════════════════════════════════════════════

@router.post("/chat")
async def chat(body: ChatRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Main chatbot endpoint.
    POST /chatbot/chat
    Body: { message, history: [{role, content}], user_id? }
    """
    # Optionally pull some product context from DB to ground the AI
    product_context = ""
    try:
        result = await db.execute(
            select(Product.name, Product.price, Product.type)
            .where(Product.is_active == True)  # noqa
            .order_by(Product.popularity_score.desc())
            .limit(8)
        )
        top_products = result.all()
        if top_products:
            product_context = "Top products in shop:\n" + "\n".join(
                f"- {p.name}: ₹{float(p.price or 0):.0f} ({p.type.value if hasattr(p.type, 'value') else p.type})"
                for p in top_products
            )
    except Exception:
        pass

    reply = await call_anthropic_api(body.message, body.history, product_context)
    return {"reply": reply}


@router.post("/recommend")
async def recommend(body: RecommendRequest, request: Request, db: AsyncSession = Depends(get_db)):
    """
    Algorithm-based product recommendation.
    POST /chatbot/recommend
    Body: { sunlight?, environment?, maintenance?, pet_friendly?, budget_max?, tags?, limit? }

    Algorithm:
    1. Fetch all active products
    2. Score each product based on matching attributes (weighted)
    3. Sort by score desc, then popularity desc
    4. Return top N with match_score and match_reasons
    """
    results = await score_and_rank_products(db, body, request)

    return {
        "recommendations": results,
        "algorithm": "weighted_attribute_matching",
        "weights": SCORE_WEIGHTS,
        "total_scored": len(results),
    }


@router.get("/recommend/quick")
async def quick_recommend(
    request: Request,
    db: AsyncSession = Depends(get_db),
    environment: Optional[str] = None,
    sunlight: Optional[str] = None,
    budget: Optional[float] = None,
    pet_friendly: Optional[bool] = None,
    limit: int = 4,
):
    """
    Quick GET endpoint for recommendation (easy to call from frontend).
    GET /chatbot/recommend/quick?environment=indoor&sunlight=shade&budget=500&limit=4
    """
    req = RecommendRequest(
        environment=environment,
        sunlight=sunlight,
        budget_max=budget,
        pet_friendly=pet_friendly,
        limit=limit,
    )
    try:
        results = await score_and_rank_products(db, req, request)
    except Exception:
        results = []
    return {"recommendations": results}
