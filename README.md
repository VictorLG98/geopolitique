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
