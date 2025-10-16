# Smart Healthcare System for Urban Hospitals 🏥

A modern **Next.js (App Router)** web application for managing **doctors, appointments, and patient medical records** with **Firebase Authentication** and **MongoDB**. Built for SLIIT coursework and deployable to production.

## ✨ Key Features

- **Authentication**: Email/Password + Google OAuth, protected routes, session cookies
- **Appointments**: Book, view, reschedule, cancel; doctor availability checks
- **Patients**: Personal dashboard, linked appointments and records
- **Doctors**: Seed sample doctors, doctor profiles, calendar availability
- **Medical Records**: Create and view patient medical records
- **Role Checks**: Basic role utilities for guarding pages and APIs
- **API Routes**: REST-style Next.js routes (appointments, doctors, records, users)
- **Quality**: Unit tests (Jest), Biome for lint/format

## 🧱 Tech Stack

- **Frontend/SSR**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Auth**: Firebase Web SDK + Admin SDK (server)
- **Database**: MongoDB with Mongoose
- **Validation**: Zod
- **Testing**: Jest
- **Tooling**: Biome (lint/format), Turbopack dev/build

## 📦 Repository Structure

Top-level folder of interest:
```
smart-healthcare-system/
├── ACCESS_CONTROL.md
├── DOCTOR_PORTAL.md
├── HOW_TO_ADD_RECORDS.md
├── MONGODB_AUTH.md
├── MULTI_USER_LOGIN.md
├── PATIENT_RECORDS.md
├── QUICK_START_ADD_RECORDS.md
├── README.md
├── UNIFIED_LOGIN.md
├── __tests__/
├── __tests__
│   ├── api.appointments.test.ts
│   ├── zod.schemas.test.ts
├── biome.json
├── jest.config.ts
├── jest.setup.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public/
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   ├── window.svg
├── src/
├── src
│   ├── app/
│   ├── app
│   │   ├── about/
│   │   ├── about
│   │   ├── admin/
│   │   ├── admin
│   │   ├── api/
│   │   ├── api
│   │   ├── appointments/
│   │   ├── appointments
│   │   ├── contact/
│   │   ├── contact
│   │   ├── dashboard/
│   │   ├── dashboard
│   │   ├── doctor/
│   │   ├── doctor
│   │   ├── doctors/
│   │   ├── doctors
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── login
│   │   ├── my-records/
│   │   ├── my-records
│   │   ├── page.tsx
│   │   ├── patients/
│   │   ├── patients
│   │   ├── records/
│   │   ├── records
│   │   ├── register/
│   │   ├── register
│   ├── components/
│   ├── components
│   │   ├── AuthProvider.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── appointments/
│   │   ├── appointments
│   ├── lib/
│   ├── lib
│   │   ├── api.ts
│   │   ├── errors.ts
│   │   ├── firebase.ts
│   │   ├── firebaseAdmin.ts
│   │   ├── mongodb.ts
│   │   ├── validators.ts
│   ├── middleware.ts
│   ├── models/
│   ├── models
│   │   ├── index.ts
├── tsconfig.json
```
> Hint: Your working directory for all commands is **`smart-healthcare-system/`** (not the repo root).

### Important Paths
- `src/app/api/*` — API routes (appointments, doctors, medical-records, users)
- `src/app/*` — Pages (login, register, dashboard, appointments, records, patients, etc.)
- `src/components/*` — UI components (AuthProvider, Navbar, Footer, appointments components)
- `src/lib/*` — Firebase, MongoDB connectors, validators, helpers
- `src/models/index.ts` — Mongoose schemas (Doctor, Appointment, Patient, MedicalRecord)
- `__tests__/*` — Jest test suites for API and validation
- Docs: `ACCESS_CONTROL.md`, `MULTI_USER_LOGIN.md`, `PATIENT_RECORDS.md`, `UNIFIED_LOGIN.md`, etc.

## ✅ Prerequisites

- **Node.js** 18+ (LTS recommended) and **npm**
- **MongoDB** connection string (Atlas or local)
- **Firebase project** with Email/Password + Google Sign-In enabled

## 🔐 Environment Variables

Create a file **`smart-healthcare-system/.env.local`** with:

```bash
# --- Mongo ---
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"

# --- Firebase Client (used in browser) ---
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# --- Firebase Admin (used on server for API routes) ---
FIREBASE_PROJECT_ID="..."
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxx@<project>.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n<key>\n-----END PRIVATE KEY-----\n"

# Optional
NODE_ENV="development"
```

> Ensure you escape newlines in `FIREBASE_PRIVATE_KEY` as `\n` when storing in `.env.local`.

## 🏃 Local Development — How to Run

1) **Go to the app folder**
```bash
cd smart-healthcare-system
```

2) **Install dependencies**
```bash
npm install
```
> If you see `npm ERR! enoent Could not read package.json`, you’re likely in the **wrong folder**. `package.json` lives inside `smart-healthcare-system/`—`cd` into it first.

3) **Create `.env.local`** (see above)

4) **Start the dev server**
```bash
npm run dev
```
Turbopack dev server will start (default: http://localhost:3000).

### Seed Sample Doctors (optional)
Visit this protected seed route after logging in as an admin (or temporarily unguard it during development):
```
/api/doctors/seed  (POST)  — or use the UI at /admin/seed-doctors
```

## 🧪 Testing, Linting, Formatting

```bash
# Run unit tests
npm test

# Lint (Biome)
npm run lint

# Format code (Biome)
npm run format
```

## 🚀 Production

```bash
# Build
npm run build

# Start production server
npm start
```
You can deploy to **Vercel** or any Node.js host. Ensure your environment variables are configured in the hosting platform.

## 🔧 Troubleshooting

- **`npm: not found`** — Install Node.js 18+ and npm.
- **`Could not read package.json`** — Run commands inside `smart-healthcare-system/`.
- **MongoDB connection errors** — Confirm `MONGODB_URI` and IP whitelist (if using Atlas).
- **Firebase admin errors** — Check `FIREBASE_PRIVATE_KEY` escaping and service account email.
- **Auth redirects to /login** — Session cookie not set; ensure Firebase auth works and middleware is active.

## 🗺 Roadmap (suggested)
- Role-based UI (Patient/Doctor/Admin) with granular policies
- Doctor calendar sync & richer availability rules
- Payments for private hospitals
- Notifications (email/SMS/push) and reminders
- Audit logs & admin reports
- CI (GitHub Actions) for tests/lint/build

---

**Maintainers:** SLIIT – Smart Healthcare System Team  
**License:** Educational / Coursework (specify if you add an OSS license)
