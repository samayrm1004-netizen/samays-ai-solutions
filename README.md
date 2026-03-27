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

## Setup Steps (One-Command Startup)
1. **Clone the Repository**:
   - `git clone https://github.com/samayrm1004-netizen/samays-ai-solutions.git`
   - `cd samays-ai-solutions`
2. **Environment Variables**:
   - Copy the sample variables: `cp .env.example .env`
   - Populate the `.env` OAuth keys if you wish to use Google Login.
3. **Docker Commands**:
   - Execute exactly: `docker-compose up --build`
   - The orchestrator will automatically construct Nginx, Postgres, Django, and Next.js and securely map them together natively!

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

## Example Demo Flow
1. Access the Next.js Frontend via Nginx: `http://localhost:9881`.
2. **Login**: Navigate to `/login` and authenticate using the Quick Demo Admin block, or seamlessly log in via Google OAuth.
3. **Create session**: Open the `/dashboard`, click the Creator Hub tab, define the pricing / description for a new AI asset, and publish your session logic directly to Postgres.
4. **Book session**: Navigate back to the Catalog (`/`), click on the deep details of any product, and execute the Booking modal form to reserve the session instantly. Wait exactly 60 seconds of inactivity to watch the session visually timeout natively!
