# PawMedic Pro

PawMedic Pro is a structured full-stack veterinary care platform built with FastAPI, React, Tailwind, Gemini, and Supabase-ready persistence. The project keeps a demo-friendly local JSON store for development and automatically switches to Supabase-backed storage when the production environment variables are provided.

## What the app includes

- AI skin disease analysis with image upload
- Breed identification from pet photos
- Symptom-based disease prediction
- Breed recommender flow
- Restored animal and breed gallery workflow from the earlier project
- AI prescription and diet plan generation
- PawBot chat with streaming support
- Pet dashboard with appointments, vaccinations, and weight logs
- Nearby vet discovery endpoint
- Supabase-ready backend configuration with local fallback mode

## Project structure

```text
pawmedico/
+-- backend/
|   +-- app/
|   |   +-- api/
|   |   +-- core/
|   |   +-- data/
|   |   +-- models/
|   |   +-- schemas/
|   |   +-- services/
|   |   `-- utils/
|   +-- tests/
|   +-- .env.example
|   +-- main.py
|   +-- requirements.txt
|   `-- Procfile
+-- frontend/
|   +-- public/
|   +-- src/
|   +-- .env.example
|   `-- package.json
+-- data/
+-- research/
+-- .github/workflows/
+-- Makefile
`-- README.md
```

## Environment variables

Create `backend/.env` from `backend/.env.example` and fill these later:

```env
GOOGLE_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
ENVIRONMENT=development
```

Create `frontend/.env` from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Local setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python -m uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

Backend docs: `http://localhost:8000/docs`

## Supabase setup

1. Create a new Supabase project.
2. Add the four backend secrets to `backend/.env`.
3. Run the SQL in `backend/app/data/supabase_schema.sql` inside the Supabase SQL editor.
4. Restart the backend.
5. Confirm `GET /api/v1/health` reports `"repository_mode": "supabase"`.

If Supabase keys are missing, the backend automatically stays in `local-json` demo mode and uses `backend/app/data/dev_store.json`.

## Commands

```bash
make install
make backend-dev
make frontend-dev
make backend-test
make frontend-build
make test
```

## Deployment targets

- Frontend: Vercel
- Backend: Render
- Database/Auth/Storage: Supabase

The repository includes a GitHub Actions workflow that runs backend tests and frontend production build checks on every push and pull request.
