# Deploy Phyto API on Render

## What you need

| Item | Purpose |
|------|---------|
| GitHub (or GitLab) repo | Render pulls code from git |
| `render.yaml` (repo root) | Optional “Blueprint” so Render creates the service from this file |
| `phyto_backend/runtime.txt` | Tells Render which Python version to use |
| `phyto_backend/requirements.txt` | Dependencies (`pip install`) |
| Environment variables on Render | Secrets: `DATABASE_URL`, `MONGODB_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS` |

## Path A — Blueprint (uses `render.yaml`)

1. Push this repository to GitHub (if it is not there yet).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repository and select the branch.
4. Confirm the service from `render.yaml` (name `phyto-api`, `rootDir: phyto_backend`).
5. When prompted, set **sync: false** variables: `DATABASE_URL`, `MONGODB_URL` (same values as your local `.env`, using your real Aiven password).
6. Edit `ALLOWED_ORIGINS` in the Render dashboard to include your real web app URL and your Render API URL if the browser calls the API directly.
7. Deploy. When it is live, open `https://<service-name>.onrender.com/` — you should see `Welcome to Phyto API`.

## Path B — Manual Web Service (no Blueprint)

1. **New** → **Web Service** → connect the repo.
2. **Root directory**: `phyto_backend`
3. **Runtime**: Python
4. **Build command**: `pip install -r requirements.txt`
5. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. **Instance type**: Free (or paid for always-on).
7. Under **Environment**, add at least:
   - `DATABASE_URL` — use `mysql://` or `mysql+aiomysql://` (the app accepts both).
   - `MONGODB_URL` — your Atlas SRV string (optional if you do not use Mongo features).
   - `SECRET_KEY` — long random string.
   - `ALLOWED_ORIGINS` — comma-separated origins allowed by CORS.
8. Deploy and test the root URL.

## MySQL (Aiven) from Render

- Error **2003** from your PC usually means **Aiven “trusted sources”** blocked your home IP. Render uses **different outbound IPs** than your laptop.
- In Aiven: add **Render outbound IPs** or (only for testing) a wider allow rule your team accepts. See Render’s docs on **outbound IPs** / static IP if you need a fixed address.
- After deploy, if logs show **1045**, the username/password in `DATABASE_URL` is wrong.

## Notes

- **Free** web services spin down after idle; first request can be slow (cold start).
- The `uploads/` folder on the default disk is **ephemeral**; files can disappear on restarts. Use S3/R2/etc. for production file storage.
- Run migrations from your machine or a one-off job: `alembic upgrade head` with `DATABASE_URL` pointing at Aiven (or add a release command later).
