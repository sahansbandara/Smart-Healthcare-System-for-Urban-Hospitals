# Smart Healthcare System 🏥

A modern web application for urban hospitals to manage doctors, patients, and appointments efficiently with Firebase authentication and MongoDB database.

## Features ✨

### Authentication
- ✅ **Email/Password Sign Up & Login** - Secure patient registration
- ✅ **Google OAuth** - One-click sign-in with Google
- ✅ **Protected Routes** - Dashboard accessible only to authenticated users
- ✅ **Session Management** - Persistent login state

### Patient Dashboard
- 📋 **View Your Appointments** - See all your booked appointments
- ➕ **Book Appointments** - Schedule new appointments with doctors
- 👤 **Personal Account** - Appointments linked to your account
- 🔒 **Secure Access** - Only you can see your appointments

### Core Features
- 👨‍⚕️ **Doctors Directory** - Browse available specialists
- 📅 **Appointment Booking** - Easy-to-use booking form
- 🗂️ **Patient Records** - Basic health records (coming soon)
- 📞 **Contact Information** - Hospital contact details

## Tech Stack 🛠️

- **Frontend:** Next.js 15.5.5 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Authentication:** Firebase Auth (Email/Password & Google)
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Build Tool:** Turbopack
- **Linting:** Biome

## Getting Started 🚀

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- MongoDB Atlas account
- Firebase project with Authentication enabled

### Installation

1. Clone and navigate to project:
```bash
cd smart-healthcare-system
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (`.env.local` already set up with MongoDB connection)

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production
```bash
npm run build
npm start
```

## Usage Guide 📖

### For Patients

1. **Register** - Go to `/register` and create an account (Email/Password or Google)
2. **Login** - Use `/login` to access your account
3. **Dashboard** - View and manage your appointments at `/dashboard`
4. **Book Appointments** - From dashboard, select doctor, date, and confirm

### Navigation
- **Home** (`/`) - Landing page
- **Doctors** (`/doctors`) - Browse specialists
- **Login** (`/login`) - Patient login
- **Register** (`/register`) - Create account
- **Dashboard** (`/dashboard`) - Your appointments (protected)
- **Contact** (`/contact`) - Hospital info
- **About** (`/about`) - System info

## Project Structure 📁

```
src/
├── app/
│   ├── api/              # API routes (doctors, appointments)
│   ├── dashboard/        # Patient dashboard (protected)
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── [other pages]/
├── components/
│   ├── AuthProvider.tsx  # Firebase auth context
│   ├── Navbar.tsx        # Navigation
│   └── Footer.tsx
├── lib/
│   ├── firebase.ts       # Firebase config
│   └── mongodb.ts        # MongoDB connection
└── models/
    └── index.ts          # Mongoose schemas (Doctor, Appointment, Patient)
```

## API Endpoints 🔌

- **GET /api/doctors** - List all doctors
- **GET /api/appointments?email={email}** - Get patient's appointments
- **POST /api/appointments** - Create new appointment

## Database Schema 🗄️

**Doctor:** name, specialty  
**Appointment:** doctorId, patientName, patientEmail, date, reason  
**Patient:** name, email, phone, dateOfBirth (ready for future use)

## Firebase Configuration 🔥

Firebase is configured with:
- Email/Password authentication
- Google Sign-In
- Analytics (browser only)

Configuration in `src/lib/firebase.ts`

## Scripts 📜

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## Future Enhancements 🚧

- Admin dashboard
- Appointment cancellation
- Email notifications
- Patient profile management
- Medical records
- Search/filter doctors

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs)

## Deployment

Deploy on [Vercel](https://vercel.com/new) - just connect your GitHub repo and deploy!

---

Built with ❤️ for urban hospital management
