# Phyto: UI (per mockups) + MySQL/Mongo + FastAPI — implementation blueprint

This document maps **each screen in your designs** to **routes**, **API behavior**, **MySQL vs Mongo**, and **concrete code/schema changes**. Building everything is a **multi-phase** project; use the phases as sprints.

---

## 0. Architecture decision (do this first)

| Today | Target (aligned with “works with database”) |
|--------|-----------------------------------------------|
| `phyto_web` uses **static** `data/products.ts` + **Firebase Auth** + Firestore roles | **FastAPI** is the system of record: **JWT** (or session) after **email/password** (or dev-login during QA) |
| Web does not call `phyto_backend` | All catalog, cart, orders, admin actions go through **`VITE_API_URL`** |

**Recommended path**

1. Add **`VITE_API_URL`** (e.g. `http://localhost:8000`) and a small **`api.ts`** client (Bearer token storage).
2. Implement **real login**: `POST /auth/login` + **bcrypt** on `users.password_hash` (production). Until then, **`POST /auth/dev-login`** can power internal QA only.
3. **Remove or narrow Firebase** to optional features (e.g. push) only if you still need it; otherwise delete web Firebase usage to avoid two sources of truth for roles.

---

## 1. Screen → route → API → storage

### Public marketing & shop

| Mockup | Route (suggested) | API | MySQL | Mongo (optional) |
|--------|-------------------|-----|--------|------------------|
| Home (hero, categories, editor’s choice, sliders, newsletter) | `/` | `GET /products?limit=&sort=` featured; `POST /newsletter` (new) | products, categories | hero / “perfect match” could stay computed server-side |
| Shop all + filters + sort + pagination | `/shop` | `GET /products` with query params + **total count** | products, product_tags join | primary image in `product_media` |
| Product detail (gallery, care, add-ons, reviews) | `/product/:id` | `GET /products/{id}` extend payload: images[], tags[], reviews aggregate | products, product_images, reviews, order_items | gallery + specs in `product_media` / `plant_specs` |
| Cart | `/cart` | `GET/PATCH/DELETE /cart` (authenticated) | carts, cart_items | — |
| Checkout (3 steps: shipping → payment → review) | `/checkout`, `/checkout/payment`, `/checkout/review` **or** query `?step=` | `POST /orders` with items + shipping + payment_method | orders, order_items | tracking stub in `order_tracking` (existing pattern) |
| Customer login (“Welcome”, Customer vs Partners tabs) | `/login` | `POST /auth/login`; partners same endpoint, role in JWT | users | — |
| Partner tiles (nursery / delivery) | `/login` deep links → `/admin` or `/delivery` after role check | same auth | users.role | — |

**Backend gaps**

- **`GET /products`**: add **`tags`** filter (join `product_tags`), return **`total`** for pagination, align **`type`** values with frontend (today SQLAlchemy compares `Product.type` to a string — use **enum name/value** consistently, e.g. `plant` vs `plants`).
- **`POST /newsletter`**: new table `newsletter_subscribers (email, created_at)` or reuse a simple `marketing_leads` table.
- **Reviews on product**: expose **`GET /products/{id}/reviews`** and averages (model `Review` exists).
- **Password auth**: `POST /auth/login` `{ email, password }` → verify `password_hash`, issue JWT (reuse `create_access_token`).

---

### Admin (nursery / admin)

| Mockup | Route | API | MySQL | Mongo |
|--------|-------|-----|--------|--------|
| Inventory dashboard (KPIs, table, low stock, order timeline) | `/admin` or `/admin/inventory` | `GET /nursery/...` or `GET /admin/metrics`, `GET /orders?scope=nursery` | aggregates on products, orders | order timeline from `order_tracking` |
| Categories / filters / tags admin | `/admin/categories`, `/admin/tags` | CRUD categories; CRUD allowed tag vocabulary | categories | optional tag docs |
| Add / edit product (full form + uploads) | `/admin/products/new`, `/admin/products/:id/edit` | `POST/PUT /products` (restrict `require_roles(admin, nursery)`); `POST /products/{id}/images` | products, product_tags, product_images | `product_media`, `plant_specs` |
| Nursery order management (filters, confirm, ship, export) | `/admin/orders` | extend `orders` router: list by role, `PATCH` status transitions, CSV export | orders, order_items | update tracking docs |

**Backend gaps**

- **Admin-only list products** (including inactive) + **update/delete**.
- **Order state machine** enforced server-side (pending → confirmed → shipped → delivered) matching UI buttons.
- **`nursery.router`**: flesh out endpoints referenced by UI (KPIs, assignments).

---

### Delivery partner

| Mockup | Route | API | MySQL | Mongo |
|--------|-------|-----|--------|--------|
| Delivery portal (assigned, history, sync) | `/delivery` | `GET /orders?assigned_to=me`, `PATCH` delivery status, `GET /orders/history` | orders | location updates in `order_tracking` |

**Backend gaps**

- **Filter orders** where `delivery_partner_id == current_user.id` and status in (`shipped`, …).
- **“Sync”** = refetch + optional idempotency key; no extra DB if not offline-first.

---

## 2. Database schema additions (beyond current models)

| Need | Change |
|------|--------|
| Email login | Use **`users.password_hash`**; migration sets NOT NULL for non-social users if required |
| Newsletter | New table **`newsletter_subscribers`** |
| Product type vs UI | Either **migrate enum** to match shop filters (`flowers`, `fertilizers`, …) or **mapping layer** in API |
| Checkout line extras | Already **`include_kit`**, **`include_service`** on `cart_items` / `order_items` — ensure API accepts them |
| Reviews on PDP | **`reviews`** — add endpoints + unique constraint (one review per user per product if desired) |
| Full-text search | MySQL FULLTEXT already indexed — expose `q` on `GET /products` (partially there) |

**Mongo** (already partially used)

- **`product_media`**, **`plant_specs`**, **`order_tracking`** — ensure every UI that shows images/specs/tracking reads/writes these consistently when `MONGODB_URL` is set.

---

## 3. Frontend file / folder changes (`phyto_web`)

| Area | Action |
|------|--------|
| Config | **`VITE_API_URL`** in `.env` / `.env.example` |
| HTTP | **`src/lib/api.ts`** — `api.get/post/patch`, attach `Authorization: Bearer` |
| Auth | Replace or wrap **`auth-context.tsx`**: login → store JWT; `me` → `GET /auth/me`; role from API |
| Router | Add **`/login`**, **`/delivery`**, **`/admin/products/*`, `/admin/orders`**; nested **admin layout** with sidebar matching mockups |
| Shell | **`navbar.tsx`**: Admin, Shop, Home, **search** (navigate to `/shop?q=`), **account** menu (login / profile) |
| **`footer.tsx`** | Multi-column + newsletter → **`POST /newsletter`** |
| Data | Remove long-term dependence on **`data/products.ts`**; use API + **React Query** (or SWR) for caching |
| Pages | Rebuild **home**, **shop**, **product detail**, **cart**, **checkout** (3-step), **admin***, **delivery** to match Figma (tailwind tokens, typography, sidebar) |
| Types | **`features/catalog/types.ts`** — align enum strings with **API** responses |

---

## 4. Backend file changes (`phyto_backend`)

| Area | Action |
|------|--------|
| **`auth.py`** | Add **`POST /auth/login`** (bcrypt); keep **`dev-login`** behind env flag `ALLOW_DEV_LOGIN=true` only in dev |
| **`users.py`** | `POST /users/register` for customers (hash password) |
| **`products.py`** | Tags filter, total count, fix **type** filter vs enum; admin CRUD |
| **`orders.py`** | Role-based lists, transitions, export; wire payment fields to `PaymentMethod` / `PaymentStatus` |
| **`main.py` / config** | Ensure **`ALLOWED_ORIGINS`** includes your web origin (local + production) |
| **Migrations** | Alembic revisions for new tables/columns |

---

## 5. Suggested build order (phases)

1. **API client + env + CORS** — prove `GET /products` from browser.  
2. **Login + JWT storage + `/me`** — gate cart/orders.  
3. **Shop + product detail from API** — retire static catalog for runtime.  
4. **Server cart + checkout → `POST /orders`**.  
5. **Admin product list + create/edit** (minimal fields first, then full mockup).  
6. **Admin orders** (confirm / ship).  
7. **Delivery dashboard**.  
8. **Polish UI** to match pixels (sidebar, cards, stepper, partner login tabs).

---

## 6. Files already added in repo for this track

- `phyto_web/.env.example` — includes **`VITE_API_URL`**
- `phyto_web/src/lib/api.ts` — minimal fetch wrapper

Use this document as the checklist; implement phase-by-phase to avoid a single unreviewable mega-PR.
