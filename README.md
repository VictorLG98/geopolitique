# Geopolitiqué

Blog/publication site with a public reading surface and an admin authoring interface. Posts use a rich Tiptap editor with slash-command blocks, image uploads, and embeds. Comments are gated by Cloudflare Turnstile. Newsletter notifications send on publish.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind v4 |
| Editor | Tiptap 3 — image, link, table, task-list, text-align, typography |
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2 |
| DB | SQLite (local), Postgres via Neon (prod) |
| Email | Resend |
| Images | Cloudinary |
| Anti-bot | Cloudflare Turnstile |
| Hosting | Frontend → Vercel · Backend → Railway |

## Getting started

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in your values
uvicorn app.main:app --reload
```

DB tables and seed data are created automatically on startup.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment variables

Copy `backend/.env.example` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (omit to use local SQLite) |
| `ADMIN_SECRET` | Secret key for admin dashboard auth |
| `RESEND_API_KEY` | Resend email API key |
| `RESEND_FROM` | Sender email address |
| `CLOUDINARY_URL` | Cloudinary URL (`cloudinary://key:secret@cloud`) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile server-side secret |
| `FRONTEND_URL` | Public URL of the frontend (for CORS + email links) |

## Project structure

```
backend/
  app/
    main.py       FastAPI app, CORS, env wiring, startup seed
    database.py   SQLAlchemy engine/session
    models.py     ORM models
    schemas.py    Pydantic schemas
    seed.py       Auto-seed on startup
frontend/
  src/
    app/          Next App Router — /, /posts/…, /admin/…
    components/   FeaturedCard, PostCard, Header, Footer, RichContent, admin/*
    lib/          api.ts, auth-context.tsx
```

## Deploy

- **Frontend**: Vercel — push to `main` triggers deploy automatically.
- **Backend**: Railway — configured via `backend/railway.toml` and `backend/Procfile`.
