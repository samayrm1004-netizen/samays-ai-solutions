# Samay's AI Solutions - Installation & Run Guide

## Prerequisites
- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 15+ (running locally or via Docker)
- **Docker & Docker Compose** (optional, for one-command startup)

---

## Option 1: One-Command Docker Startup (Recommended)

```bash
git clone https://github.com/samayrm1004-netizen/samays-ai-solutions.git
cd samays-ai-solutions
cp .env.example .env        # Edit .env with your credentials
docker-compose up --build   # Starts all 4 services
```

Access the app at: `http://localhost:9881`

---

## Option 2: Manual Setup (Without Docker)

### Step 1: Clone the Repository
```bash
git clone https://github.com/samayrm1004-netizen/samays-ai-solutions.git
cd samays-ai-solutions
```

### Step 2: Setup PostgreSQL Database
Create a database and user in PostgreSQL:
```sql
CREATE DATABASE samays_db;
CREATE USER samays_user WITH PASSWORD 'samays_password';
GRANT ALL PRIVILEGES ON DATABASE samays_db TO samays_user;
```

### Step 3: Backend Setup (Django)
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Configure your database connection in `core/settings.py` or set environment variables:
```
DB_HOST=localhost
DB_NAME=samays_db
DB_USER=samays_user
DB_PASS=samays_password
```

Run migrations and seed data:
```bash
python manage.py makemigrations
python manage.py migrate
python seed_data.py
```

Start the Django server:
```bash
python manage.py runserver 8000
```

### Step 4: Frontend Setup (Next.js)
Open a new terminal:
```bash
cd frontend
npm install
```

Set the API URL (create `.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Start the Next.js dev server:
```bash
npm run dev -- -p 9881
```

### Step 5: Access the Application
- Frontend: `http://localhost:9881`
- Backend API: `http://localhost:8000/api/`
- Django Admin: `http://localhost:8000/admin/`

---

## Google OAuth Setup (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to APIs & Services > Credentials
4. Create an OAuth 2.0 Client ID (Web Application)
5. Add `http://localhost:9881` to Authorized JavaScript Origins
6. Add `http://localhost:9881/login` to Authorized Redirect URIs
7. Copy the Client ID and Client Secret into your `.env` file:
   ```
   GOOGLE_OAUTH2_CLIENT_ID=your_client_id_here
   GOOGLE_OAUTH2_CLIENT_SECRET=your_client_secret_here
   ```

---

## Demo Flow
1. Open `http://localhost:9881`
2. **Login**: Click "Sign In" and use the Demo Login (Admin/User/Creator)
3. **Create Session**: Go to Dashboard > Creator Studio > fill the form > "Create Product"
4. **Edit/Delete Session**: Use the Edit/Delete buttons under published products
5. **Book Session**: Navigate to Catalog > click a product > "Book Now" > fill details
6. **Session Timeout**: After login, observe the 60-second inactivity timer in the navbar

---

## Backend Dependencies (requirements.txt)
```
Django==5.0.3
djangorestframework==3.15.1
psycopg[binary]==3.1.18
djangorestframework-simplejwt==5.3.1
drf-social-oauth2==2.1.4
django-cors-headers==4.3.1
google-auth==2.29.0
```

## Frontend Dependencies
All managed via `package.json`. Install with `npm install`.

Key packages: Next.js, React, Framer Motion, TypeScript
