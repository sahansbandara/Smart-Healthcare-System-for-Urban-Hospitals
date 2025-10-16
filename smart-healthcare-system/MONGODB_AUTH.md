# MongoDB Doctor Authentication Flow 🔐

## Overview
The doctor authentication system now uses **MongoDB as the source of truth** for doctor accounts, with Firebase handling the authentication credentials.

## How It Works

### Registration Flow
```
1. Doctor fills registration form
   ├─ Email/Password OR Google OAuth
   └─ Selects medical specialty

2. Firebase Authentication
   ├─ Creates user account
   └─ Returns userId (UID)

3. MongoDB Database
   ├─ Creates doctor profile
   ├─ Links to Firebase userId
   └─ Stores: name, email, specialty, userId
```

### Login Flow
```
1. Doctor enters credentials
   
2. MongoDB Verification (FIRST)
   ├─ API: POST /api/doctors/login
   ├─ Checks if doctor exists in database
   └─ Returns doctor profile if found

3. Firebase Authentication (SECOND)
   ├─ Validates email/password OR Google
   └─ Creates session

4. Redirect to Dashboard
   └─ Only if BOTH checks pass
```

## API Endpoints

### POST /api/doctors/login
**Purpose:** Verify doctor exists in MongoDB before Firebase auth

**Request:**
```json
{
  "email": "doctor@hospital.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "doctor": {
    "id": "mongodb_id",
    "name": "Dr. John Smith",
    "email": "doctor@hospital.com",
    "specialty": "Cardiologist",
    "userId": "firebase_uid"
  }
}
```

**Error Responses:**
- `400`: Email not provided
- `404`: Doctor not found in database
- `500`: Database connection error

### POST /api/doctors/profile
**Purpose:** Create new doctor profile during registration

**Request:**
```json
{
  "name": "Dr. John Smith",
  "email": "doctor@hospital.com",
  "specialty": "Cardiologist",
  "userId": "firebase_uid"  // Optional
}
```

**Success Response (201):**
```json
{
  "id": "mongodb_id",
  "name": "Dr. John Smith",
  "email": "doctor@hospital.com",
  "specialty": "Cardiologist"
}
```

**Error Responses:**
- `400`: Missing required fields
- `409`: Doctor already exists
- `500`: Database error

### GET /api/doctors/profile?email={email}
**Purpose:** Retrieve doctor profile by email

## Database Schema

### Doctor Model (MongoDB)
```typescript
{
  _id: ObjectId,           // Auto-generated
  name: String,            // Required: "Dr. John Smith"
  specialty: String,       // Required: "Cardiologist"
  email: String,           // Unique, indexed
  userId: String,          // Firebase UID (unique, indexed)
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-updated
}
```

### Indexes
- `email`: Unique, sparse (allows null)
- `userId`: Unique, sparse (allows null)

## Security Features

✅ **Two-Factor Verification**
- MongoDB check prevents unauthorized Firebase users
- Firebase auth ensures secure credentials

✅ **Email Uniqueness**
- MongoDB enforces unique email constraint
- Prevents duplicate doctor accounts

✅ **User ID Linking**
- Links Firebase UID to MongoDB profile
- Enables cross-platform user tracking

✅ **Error Handling**
- Detailed logging for debugging
- User-friendly error messages
- Fallback error handling

## Debugging

### Check Database Connection
Visit: `http://localhost:3001/api/test-db`

### Console Logs
The system logs each step:
```
✓ Doctor login attempt...
✓ Database connected
✓ Login request for email: doctor@hospital.com
✓ Doctor found: {id} {name}
```

### Common Issues

**1. "No doctor account found"**
- Doctor hasn't registered in system
- Email mismatch between Firebase and MongoDB
- Solution: Register first at `/doctor/register`

**2. "Failed to verify doctor account"**
- MongoDB connection timeout
- Database credentials incorrect
- Solution: Check `.env.local` and MongoDB Atlas IP whitelist

**3. "Failed to create doctor profile"**
- Duplicate email in database
- Missing required fields
- Solution: Check if doctor already exists

## Environment Variables

Required in `.env.local`:
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## Testing

### Test Registration
1. Go to `/doctor/register`
2. Fill in all fields + select specialty
3. Submit form
4. Check console logs:
   - "Step 1: Creating Firebase account..."
   - "Step 2: Creating doctor profile in MongoDB..."
   - "Registration successful! Redirecting..."

### Test Login
1. Go to `/doctor/login`
2. Enter registered credentials
3. Check console logs:
   - "Checking doctor account in MongoDB..."
   - "Doctor verified in MongoDB: {name}"
   - "Authenticating with Firebase..."
   - "Login successful, redirecting..."

### Test Database
```bash
# View all doctors
mongosh "mongodb+srv://cluster.mongodb.net" --eval "use smart-healthcare; db.doctors.find().pretty()"

# Count doctors
mongosh "mongodb+srv://cluster.mongodb.net" --eval "use smart-healthcare; db.doctors.countDocuments()"

# Find specific doctor
mongosh "mongodb+srv://cluster.mongodb.net" --eval "use smart-healthcare; db.doctors.findOne({email: 'doctor@example.com'})"
```

## Benefits

🎯 **Single Source of Truth**
- MongoDB stores all doctor data
- Firebase only handles authentication

🔒 **Enhanced Security**
- Dual verification (MongoDB + Firebase)
- Prevents unauthorized dashboard access

📊 **Scalability**
- Easy to add fields to doctor profile
- Can query doctors by specialty, location, etc.

🔍 **Auditability**
- Timestamps track registration date
- Can see when doctors last updated profile

## Next Steps

- [ ] Add password reset via MongoDB email lookup
- [ ] Implement doctor profile editing
- [ ] Add admin panel to approve new doctors
- [ ] Track login history in MongoDB
- [ ] Add doctor availability scheduling
