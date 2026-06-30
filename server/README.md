# SafeInspect API Server

Node.js + Express + Prisma backend for the SafeInspect mobile app.

## Stack

| Layer | Tech |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Push | Expo Server SDK |
| Validation | Zod |

---

## Local development

```bash
cd server
cp .env.example .env         # fill in DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run db:seed              # creates SUP-001 and INS-001 test accounts
npm run dev                  # starts on http://localhost:3000
```

Health check: `GET http://localhost:3000/health`

---

## Deploy to Railway (recommended — free tier available)

1. Push this repo to GitHub (already done).
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub.
3. Select `belabedmohamedins-tech/SafeInspect-APP`.
4. Railway auto-detects `server/package.json`. Set **Root Directory** to `server`.
5. Add a **PostgreSQL** plugin — Railway auto-injects `DATABASE_URL`.
6. Add environment variables:
   ```
   JWT_SECRET=<openssl rand -hex 64>
   JWT_EXPIRES_IN=30d
   CORS_ORIGINS=*
   PORT=3000
   ```
7. Deploy. Railway runs `npm run build && npm start` automatically.
8. Copy the public URL (e.g. `https://safeinspect-api.railway.app`).
9. Set in the mobile app `.env`:
   ```
   EXPO_PUBLIC_SYNC_API_URL=https://safeinspect-api.railway.app
   ```

---

## Deploy to Render (alternative)

1. New Web Service → connect GitHub repo.
2. Root directory: `server`
3. Build command: `npm install && npm run db:migrate && npm run build`
4. Start command: `npm start`
5. Add a **PostgreSQL** database → copy `DATABASE_URL` to env vars.
6. Add `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS`, `PORT`.

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login with matricule + password → JWT |
| POST | `/auth/register-push-token` | ✅ | Register Expo push token |
| GET | `/auth/me` | ✅ | Get current inspector profile |

### Sync

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/sync` | ✅ | Upload batch of inspections, actions, agenda items |

### Approvals

| Method | Path | Auth | Role |
|---|---|---|---|
| GET | `/approvals?status=PENDING` | ✅ | SUPERVISOR, ADMIN |
| POST | `/approvals/:id/approve` | ✅ | SUPERVISOR, ADMIN |
| POST | `/approvals/:id/return` | ✅ | SUPERVISOR, ADMIN |

### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Liveness check |

---

## Seed accounts

| Role | Matricule | Password |
|---|---|---|
| SUPERVISOR | SUP-001 | supervisor123 |
| INSPECTOR | INS-001 | inspector123 |

> ⚠️ Change these before any real deployment.

---

## Database migrations

```bash
# Development (creates migration file + applies it)
npx prisma migrate dev --name <description>

# Production (apply pending migrations only)
npx prisma migrate deploy

# View data
npx prisma studio
```
