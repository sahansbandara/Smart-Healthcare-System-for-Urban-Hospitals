# 🔐 Unified Login System

## Overview
The Smart Healthcare System now uses **ONE unified login page** for both doctors and patients! The system automatically detects the user's role and redirects them to the appropriate dashboard.

---

## 🎯 How It Works

### **Single Login Page**
- **URL:** http://localhost:3000/login
- Both doctors and patients use the same login page
- System automatically checks user role from database
- Redirects to appropriate dashboard based on role

### **Automatic Role Detection**
1. User enters email and password
2. Firebase authenticates the user
3. System checks MongoDB to determine if user is:
   - **Doctor** → Redirect to `/doctor/dashboard`
   - **Patient** → Redirect to `/dashboard`
   - **Unknown** → Show error message

---

## 🚀 User Flow

### **For Patients:**
1. Go to http://localhost:3000/login
2. Enter email and password (or use Google)
3. ✅ **Automatically redirected to Patient Dashboard**

### **For Doctors:**
1. Go to http://localhost:3000/login
2. Enter email and password (or use Google)
3. ✅ **Automatically redirected to Doctor Dashboard**

---

## 📝 Registration

### **Patient Registration**
- **URL:** http://localhost:3000/register
- Creates patient account
- Stored in `patients` collection

### **Doctor Registration**
- **URL:** http://localhost:3000/doctor/register
- Creates doctor account
- Stored in `doctors` collection
- Requires specialty selection

---

## 🔄 Key Changes

### **Before (Separate Logins):**
```
❌ /login → Patient login only
❌ /doctor/login → Doctor login only
❌ User had to know which page to use
```

### **After (Unified Login):**
```
✅ /login → Universal login for everyone
✅ System auto-detects role
✅ Automatic redirect to correct dashboard
```

---

## 🎨 Login Page Features

### **Email/Password Login**
- Standard authentication
- Role detection after successful login
- Error messages for invalid credentials

### **Google OAuth Login**
- One-click Google sign-in
- Automatic role detection
- Works for both doctors and patients

### **Registration Links**
- Two buttons at bottom of login page:
  - **"Register as Patient"** → Green button
  - **"Register as Doctor"** → Blue button

---

## 🧪 Testing the Unified Login

### **Test Scenario 1: Patient Login**
1. Register a patient at http://localhost:3000/register
   - Email: `testpatient@example.com`
   - Password: `password123`
2. Go to http://localhost:3000/login
3. Login with patient credentials
4. ✅ Should redirect to `/dashboard` (Patient Dashboard)

### **Test Scenario 2: Doctor Login**
1. Register a doctor at http://localhost:3000/doctor/register
   - Email: `testdoctor@example.com`
   - Password: `password123`
   - Specialty: `Cardiology`
2. Go to http://localhost:3000/login
3. Login with doctor credentials
4. ✅ Should redirect to `/doctor/dashboard` (Doctor Dashboard)

### **Test Scenario 3: Google Login**
1. Click "Login with Google"
2. Select Google account
3. System checks if you're registered as doctor or patient
4. ✅ Redirects to appropriate dashboard

---

## 🛠️ Technical Implementation

### **API Endpoint: `/api/users/check-role`**
```typescript
GET /api/users/check-role?email=user@example.com

Response for Doctor:
{
  "role": "doctor",
  "user": {
    "id": "...",
    "name": "Dr. John Doe",
    "email": "doctor@example.com",
    "specialty": "Cardiology"
  }
}

Response for Patient:
{
  "role": "patient",
  "user": {
    "email": "patient@example.com",
    "name": "Jane Smith"
  }
}

Response for Unknown:
{
  "role": "unknown",
  "message": "User not found. Please register first."
}
```

### **Login Flow:**
```
1. User submits login form
2. Firebase authenticates user
3. Get user email
4. Call /api/users/check-role?email=xxx
5. Check MongoDB:
   - Search in 'doctors' collection
   - If not found, search in 'patients' collection
6. Return role and user data
7. Redirect based on role:
   - doctor → /doctor/dashboard
   - patient → /dashboard
   - unknown → show error
```

---

## 📱 Navigation Updates

### **Navbar Changes:**
- **Before Login:** Single "Login" button
- **After Login as Patient:** "Dashboard" button
- **After Login as Doctor:** "Dashboard" + "Patient Records" buttons

### **No More Separate Links:**
- ❌ Removed "Patient Login" / "Doctor Login" separation
- ✅ Single "Login" button for everyone
- System handles routing automatically

---

## 🔐 Security

### **Role Verification:**
- User role stored in MongoDB
- Cannot access wrong dashboard
- Role checked on every login
- Protected routes verify user type

### **Session Management:**
- Firebase handles authentication tokens
- MongoDB stores user role data
- Automatic logout clears all sessions

---

## 💡 Benefits

1. **Simpler User Experience**
   - Users don't need to know if they should use "/login" or "/doctor/login"
   - One login page for everyone

2. **Automatic Routing**
   - System knows user type
   - No manual selection needed
   - Always redirects correctly

3. **Cleaner Navigation**
   - Less confusing UI
   - Single entry point
   - Professional appearance

4. **Multi-User Support**
   - Multiple doctors and patients can login simultaneously
   - Each gets correct dashboard
   - No conflicts

---

## 🔗 Quick Links

- **Unified Login:** http://localhost:3000/login
- **Patient Registration:** http://localhost:3000/register
- **Doctor Registration:** http://localhost:3000/doctor/register
- **Patient Dashboard:** http://localhost:3000/dashboard
- **Doctor Dashboard:** http://localhost:3000/doctor/dashboard

---

## ❓ Troubleshooting

### **"User role not found"**
- **Problem:** Email exists in Firebase but not in MongoDB
- **Solution:** Complete registration process
- Register as patient or doctor to create database record

### **Wrong dashboard displayed**
- **Problem:** Role detection error
- **Solution:** Logout and login again
- Check which collection (doctors/patients) has your email

### **Can't login**
- **Problem:** Invalid credentials or user not registered
- **Solution:** 
  - Check email/password spelling
  - Register if first time user
  - Use "Forgot Password" if available

---

## 🎉 Summary

**One login page → Automatic role detection → Correct dashboard!**

No more confusion about which login to use. The system is smart enough to know who you are and where to send you! 🚀

---

**Old URLs Still Work:**
- `/doctor/login` still exists but redirects to `/login`
- Bookmark http://localhost:3000/login for easiest access
