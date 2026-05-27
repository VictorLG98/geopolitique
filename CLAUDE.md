# Geopolitiqué — Project Context

Blog/publication site with a public reading surface and an admin authoring surface. Posts use a Tiptap-based rich editor with slash-command blocks, image uploads, and embeds. Comments are gated by Cloudflare Turnstile. Newsletter notifications are sent on publish.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js **16.2** (App Router), React **19.2**, TypeScript, Tailwind **v4** |
| Editor | Tiptap 3 (starter-kit + image, link, table, task-list, text-align, typography, etc.) |
| Backend | FastAPI, SQLAlchemy 2, Pydantic v2 |
| DB | SQLite locally (`backend/geopolitique.db`), Postgres in prod (Neon via `psycopg2-binary`) |
| Email | Resend |
| Images | Cloudinary (SDK reads `CLOUDINARY_URL`) |
| Anti-bot | Cloudflare Turnstile (server-side verify in backend) |
| Hosting | Backend → Railway (`backend/Procfile`, `railway.toml`). Frontend → Vercel. |

## Paths

```
backend/
  app/
    main.py        FastAPI app, CORS, env wiring (Resend, Cloudinary, Turnstile), startup seed
    database.py    SQLAlchemy engine/session (SQLite ↔ Postgres)
    models.py      ORM models
    schemas.py     Pydantic schemas
    seed.py        Auto-seed on startup
  Procfile, railway.toml, requirements.txt, geopolitique.db (local)
frontend/
  src/
    app/           Next App Router — `/` (home), `/posts/...`, `/admin/...`
    components/    FeaturedCard, PostCard, Header, Footer, RichContent, SearchOverlay, admin/*
    lib/api.ts, lib/auth-context.tsx
  AGENTS.md        ⚠️ Read before touching Next code (see Conventions)
  package.json, next.config.ts, tsconfig.json
.claude/
  settings.json, settings.local.json
  skills/         Local skills: caveman, diagnose, frontend-design, grill-me
```

## Commands

| Task | Command |
|---|---|
| Frontend dev | `cd frontend && npm run dev` |
| Frontend build | `cd frontend && npm run build` |
| Frontend lint | `cd frontend && npm run lint` |
| Backend dev | `cd backend && source venv/bin/activate && uvicorn app.main:app --reload` |
| Backend deps | `cd backend && pip install -r requirements.txt` |

## Conventions / Warnings

- **Next.js 16 has breaking changes vs. training data.** Per `frontend/AGENTS.md`: read `frontend/node_modules/next/dist/docs/` before writing Next code. Heed deprecation notices. APIs, conventions, and file structure may differ.
- **React 19 + Tailwind v4** — both are recent majors; defer to installed docs over memory.
- **Admin sidebar is collapsible with persistence** — there is an existing helper for local datetime formatting (see recent commits).
- **RichEditor has a slash-command menu** for rich blocks, lists, and media embeds. Image uploads go through a backend endpoint that pushes to Cloudinary.
- **Backend env vars** consumed in `app/main.py`: `ADMIN_SECRET`, `RESEND_API_KEY`, `RESEND_FROM`, `FRONTEND_URL`, `CLOUDINARY_URL`, `TURNSTILE_SECRET_KEY`. `backend/.env` is git-tracked and may have uncommitted local edits — do not commit secrets.
- **DB tables are auto-created and auto-seeded on app startup** (`Base.metadata.create_all` + `seed_db`). Local SQLite file is `backend/geopolitique.db`.

## Key References

- Frontend deploy: Vercel (`FRONTEND_URL` defaults to `https://geopolitique.vercel.app`).
- Backend deploy: Railway (`backend/railway.toml`, `backend/Procfile`).
- Editor docs: Tiptap v3 (`@tiptap/*` 3.23.x).

## Quick Resume Context

Static-feeling blog with admin authoring. Frontend = Next 16 / React 19 / Tailwind 4 / Tiptap. Backend = FastAPI + SQLAlchemy, talks to Neon (Postgres) in prod and SQLite locally. Comments gated by Turnstile; images via Cloudinary; emails via Resend. Recent work has focused on the rich editor (slash menu, image upload) and the admin shell (collapsible sidebar).
