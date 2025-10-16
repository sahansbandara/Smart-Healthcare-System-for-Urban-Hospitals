# Doctor Portal Documentation 👨‍⚕️

## Overview
The doctor portal allows medical professionals to register, login, and manage their appointments through a dedicated dashboard.

## Features

### Authentication
- ✅ **Email/Password Registration & Login**
- ✅ **Google OAuth Sign-In**
- ✅ **Profile Verification** - Ensures only registered doctors can access the dashboard
- ✅ **Separate Login Flow** - Distinct from patient authentication

### Doctor Dashboard
- 📊 **Statistics Overview**
  - Total appointments
  - Today's appointment count
  - Upcoming appointments
  - Unique patients count

- 📅 **Appointment Management**
  - View all appointments
  - Filter by: Today, Upcoming, All
  - See patient details (name, email, reason)
  - Appointment status indicators
  - Chronological sorting

- 👤 **Doctor Profile**
  - Name display
  - Specialty
  - Email
  - Professional header

## Routes

### Doctor Authentication
- `/doctor/login` - Doctor login page
- `/doctor/register` - Doctor registration page
- `/doctor/dashboard` - Protected doctor dashboard

### API Endpoints
- `GET /api/doctors/profile?email={email}` - Get doctor profile
- `POST /api/doctors/profile` - Create doctor profile
- `GET /api/appointments?doctorId={id}` - Get doctor's appointments

## Database Schema

### Doctor Model (Updated)
\`\`\`typescript
{
  name: string,           // Doctor's full name
  specialty: string,      // Medical specialty
  email: string,          // Email (unique, optional)
  userId: string,         // Firebase UID (unique, optional)
  timestamps: true
}
\`\`\`

## User Flow

### Registration
1. Visit `/doctor/register`
2. Fill in:
   - Full Name
   - Email
   - Specialty (dropdown)
   - Password
   - Confirm Password
3. OR click "Register with Google"
4. System creates:
   - Firebase authentication account
   - Doctor profile in MongoDB
5. Redirected to doctor dashboard

### Login
1. Visit `/doctor/login`
2. Enter email/password OR use Google
3. System verifies doctor profile exists
4. If no profile found, shows error
5. Redirected to doctor dashboard

### Dashboard Usage
1. View appointment statistics
2. Filter appointments:
   - **Today** - Today's appointments only
   - **Upcoming** - Future appointments
   - **All** - Complete history
3. See patient details for each appointment
4. Track appointment status (Scheduled/Completed)

## Navigation

### For Doctors
- **Header Shows:**
  - "Doctor Dashboard" button (when logged in)
  - "Doctor Login" button (when logged out)
  - Logout button

### For Patients
- **Header Shows:**
  - "Patient Login" button
  - "Doctor" link (to doctor login)
  - Full navigation menu

## Specialty Options
- Cardiologist
- Dermatologist  
- Pediatrician
- Neurologist
- Orthopedic Surgeon
- General Practitioner
- Ophthalmologist
- Psychiatrist

## Security Features
- Firebase Authentication for secure login
- Protected routes (dashboard requires authentication)
- Email verification on registration
- Password minimum length (6 characters)
- Profile verification before dashboard access
- MongoDB unique constraints on email

## Visual Indicators
- 🔵 **Blue** styling for doctor-specific elements
- **Today's appointments** highlighted with blue border
- **Status badges:**
  - Green "Scheduled" for upcoming appointments
  - Gray "Completed" for past appointments
  - Blue "Today" tag for current day appointments

## Error Handling
- Invalid credentials notification
- No doctor profile found error
- Password mismatch detection
- Required field validation
- Network error handling

## Integration with Patient System
- Appointments created by patients appear in doctor dashboard
- Doctor IDs link appointments to specific doctors
- Email-based appointment filtering
- Shared MongoDB database
- Unified Firebase authentication

## Testing Checklist
- [ ] Register new doctor account
- [ ] Login with email/password
- [ ] Login with Google
- [ ] View dashboard statistics
- [ ] Filter appointments (Today/Upcoming/All)
- [ ] View patient details
- [ ] Logout functionality
- [ ] Protected route redirection

## Next Steps (Future Enhancements)
- [ ] Appointment acceptance/rejection
- [ ] Patient medical history access
- [ ] Schedule management (set availability)
- [ ] Prescription writing
- [ ] Notes on appointments
- [ ] Email notifications for new appointments
- [ ] Calendar view
- [ ] Export appointment data
