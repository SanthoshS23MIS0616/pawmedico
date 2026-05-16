# PetMedico

PetMedico is a structured FastAPI + React veterinary care platform with dual-mode operation:

- Demo mode works locally without live keys.
- Live mode activates automatically when Supabase and Groq environment variables are present.

The repository now keeps the existing gallery, recommender, AI analysis, prescription, dashboard, appointments, vaccinations, and chat flows while upgrading the project into a production-ready full-stack structure.

## Core features

- Supabase-ready auth with Google OAuth and email/password
- Demo fallback when live auth is not configured
- Auth-aware pet dashboard with owner-scoped pets, records, weights, vaccinations, and appointments
- Supabase Storage-ready pet photo upload flow with local upload fallback
- Breed recommender backed by `backend/app/data/dog_data_09032022.csv`
- Skin disease analysis, breed identification, symptom prediction, and PawBot chat
- Prescription PDF generation with production-safe asset URLs
- Nearby veterinary clinics with OpenStreetMap + Overpass + Leaflet
- i18n-ready frontend with English, Tamil, and Hindi resources
- Recharts-based weight trend visualization
- Vercel-ready frontend routing config

## Project structure

```text
petmedico/
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
|   `-- requirements.txt
+-- frontend/
|   +-- public/
|   +-- src/
|   +-- .env.example
|   +-- package.json
|   `-- vercel.json
+-- research/
+-- .github/
+-- Makefile
`-- README.md
```

## Environment variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
GROQ_API_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-frontend-domain.vercel.app
PUBLIC_API_URL=http://localhost:8000
ENVIRONMENT=development
```

Notes:

- `GROQ_API_KEY` powers chat, prescription generation, and image analysis.
- `SUPABASE_SERVICE_ROLE_KEY` is backend-only.
- Normal user CRUD should flow through the anon key plus user JWT so row-level security applies.

### Frontend

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
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

1. Create a Supabase project.
2. Run `backend/app/data/supabase_schema.sql` in the Supabase SQL editor.
3. Create a public storage bucket named `pet-photos`.
4. Add row-level security policies for bucket objects scoped to `auth.uid()`.
5. Add your Supabase values to both backend and frontend env files, plus `GROQ_API_KEY` in the backend env file.
6. Restart both apps.
7. Confirm `GET /api/v1/auth/config` and `GET /api/v1/health` report live readiness.

## API behavior

- Demo mode:
  The backend stores data in `backend/app/data/dev_store.json`.
- Live mode:
  Authenticated requests use `Authorization: Bearer <token>` and server-inferred ownership.
- Pet ownership:
  `owner_id` is always derived from the authenticated or demo identity, not trusted from the client payload.

## Verification status

- Backend tests: `25 passed`
- Frontend TypeScript build: passed
- Frontend production build: passed

## Deployment targets

- Frontend: Vercel
- Backend: Render
- Auth/Database/Storage: Supabase

## Current limitation

Groq access is wrapped behind `backend/app/services/groq_service.py`. Live AI verification still depends on you adding a real `GROQ_API_KEY`, and the vision path also depends on Groq vision model availability for your account.
