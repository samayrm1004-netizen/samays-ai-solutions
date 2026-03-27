# Samays AI Sessions Marketplace

Full-stack assignment implementation using Next.js, Django REST Framework, PostgreSQL, Docker, and Nginx.

## Implemented Assignment Scope
- OAuth-ready auth flow (Google token exchange) + backend-issued JWT.
- Demo login endpoint for easy evaluator testing without external OAuth setup.
- Role-based behavior:
  - `User`: profile update + booking history.
  - `Creator`: create/manage sessions + booking overview.
- Public catalog, session detail, and real booking flow.
- Django admin model registrations for users, sessions, and bookings.
- Dockerized 4-service setup: frontend, backend, db, reverse proxy.

## One-Command Startup
1. Copy environment file:
   - `cp .env.example .env`
2. Start services:
   - `docker-compose up --build`

## Access URLs
- App (Nginx): `http://localhost:9881`
- API via Nginx: `http://localhost:9881/api/`
- Django Admin: `http://localhost:9881/admin/` (also mapped from `/api/admin/`)
- Direct backend (dev): `http://localhost:8000`
- Direct frontend (dev): `http://localhost:3000`

## API Highlights
- Auth:
  - `POST /api/users/auth/google/`
  - `POST /api/users/auth/demo/`
  - `POST /api/users/auth/refresh/`
- Profile:
  - `GET/PATCH /api/users/profile/`
- Sessions:
  - `GET /api/products/`
  - `GET /api/products/:id/`
  - `POST /api/products/` (creator only)
- Bookings:
  - `GET /api/bookings/`
  - `POST /api/bookings/`

## OAuth Setup (Google)
1. Create OAuth credentials in Google Cloud Console.
2. Put client values in `.env`:
   - `GOOGLE_OAUTH2_CLIENT_ID`
   - `GOOGLE_OAUTH2_CLIENT_SECRET`
3. Use the login page token exchange flow.

## Suggested Demo Flow
1. Open `http://localhost:9881`.
2. Sign in from `/login`:
   - Quick path: demo login as `user` or `creator`.
   - OAuth path: provide Google ID token.
3. Browse catalog and open a session detail page.
4. Book a session (user flow).
5. Open `/dashboard`:
   - User sees active/past bookings and editable profile.
   - Creator can create sessions and view booking overview.
