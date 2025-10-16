# Patient Record Management System 📋

## Overview
The **Patient Record Management System** allows doctors to search for patients, view their complete medical history, add new consultations with diagnoses and prescriptions, and maintain a comprehensive audit trail of all medical interactions.

## Features Implemented ✅

### 1. Patient Search
- 🔍 Search patients by email address
- Instant retrieval of complete medical records
- Auto-creation of empty record if patient exists but has no medical history
- Error handling for non-existent patients

### 2. Patient Information Display
- **Patient Summary Card**
  - Name and email
  - Allergies (if recorded)
  - Chronic conditions (if recorded)
  - Total consultation count

### 3. Add New Consultation
Comprehensive consultation entry form including:

#### Basic Information
- **Symptoms** * (Required)
- **Observations**
- **Date/Time** (Auto-captured)
- **Doctor Information** (Auto-filled from logged-in doctor)

#### Vital Signs
- Blood Pressure (e.g., 120/80)
- Temperature (°F)
- Heart Rate (bpm)
- Weight (kg)
- Height (cm)

#### Diagnoses * (Required - at least one)
- Condition/Disease name
- Severity level (Mild, Moderate, Severe)
- Additional notes
- **Dynamic fields** - Add multiple diagnoses

#### Prescriptions
- Medicine name
- Dosage
- Frequency
- Duration
- Special instructions
- **Dynamic fields** - Add multiple prescriptions

#### Additional Details
- Clinical notes
- Follow-up date
- Lab test orders (future enhancement)
- Attachment uploads (future enhancement)

### 4. Consultation History
- **Chronological view** of all past consultations
- Most recent consultations shown first
- Each entry displays:
  - Doctor name and specialty
  - Date and time of consultation
  - Symptoms reported
  - Diagnoses with severity
  - Prescriptions with full details
  - Clinical notes
- **Expandable cards** for easy navigation

### 5. Data Validation
- Ensures symptoms or observations are provided
- Requires at least one diagnosis
- Validates all required fields before saving
- Prevents incomplete records

### 6. Audit Logging
Every consultation is automatically logged with:
- Action type (CREATE/UPDATE/VIEW)
- Entity type (MedicalRecord)
- Performer details (Doctor ID, name, role)
- Changes made
- Timestamp
- IP address (optional)

## Database Schema

### Medical Record Model
```typescript
{
  patientId: ObjectId (ref: Patient),
  patientEmail: String,
  patientName: String,
  
  consultations: [{
    date: Date,
    doctorId: ObjectId (ref: Doctor),
    doctorName: String,
    symptoms: String,
    observations: String,
    
    vitalSigns: {
      bloodPressure: String,
      temperature: String,
      heartRate: String,
      weight: String,
      height: String
    },
    
    diagnoses: [{
      condition: String,
      severity: Enum['Mild', 'Moderate', 'Severe'],
      notes: String
    }],
    
    prescriptions: [{
      medicineName: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    
    labTests: [{
      testName: String,
      status: Enum['Ordered', 'Completed', 'Pending'],
      results: String,
      attachmentUrl: String
    }],
    
    attachments: [{
      fileName: String,
      fileType: String,
      uploadDate: Date,
      url: String,
      description: String
    }],
    
    followUpDate: Date,
    notes: String
  }],
  
  allergies: [String],
  chronicConditions: [String],
  
  surgicalHistory: [{
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String
  }],
  
  familyHistory: [{
    relation: String,
    condition: String
  }]
}
```

### Audit Log Model
```typescript
{
  action: Enum['CREATE', 'UPDATE', 'VIEW', 'DELETE'],
  entityType: Enum['Patient', 'MedicalRecord', 'Appointment', 'Doctor'],
  entityId: ObjectId,
  
  performedBy: {
    userId: String,
    userName: String,
    userRole: Enum['Doctor', 'Nurse', 'Admin', 'Patient']
  },
  
  changes: Mixed,
  ipAddress: String,
  timestamp: Date (auto)
}
```

## API Endpoints

### GET /api/medical-records?email={email}
**Purpose:** Fetch patient's complete medical record

**Request:**
```
GET /api/medical-records?email=patient@example.com
```

**Response (200):**
```json
{
  "patientId": "...",
  "patientEmail": "patient@example.com",
  "patientName": "John Doe",
  "consultations": [...],
  "allergies": ["Penicillin"],
  "chronicConditions": ["Hypertension"],
  "surgicalHistory": [],
  "familyHistory": []
}
```

**Response (404):** Patient not found

---

### POST /api/medical-records
**Purpose:** Add new consultation to patient record

**Request:**
```json
{
  "patientEmail": "patient@example.com",
  "doctorId": "doctor_mongodb_id",
  "doctorName": "Dr. Smith",
  "consultation": {
    "symptoms": "Fever, headache",
    "observations": "Temperature elevated",
    "vitalSigns": {
      "bloodPressure": "120/80",
      "temperature": "101.5",
      "heartRate": "85"
    },
    "diagnoses": [{
      "condition": "Viral Fever",
      "severity": "Mild",
      "notes": "Common cold symptoms"
    }],
    "prescriptions": [{
      "medicineName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "Twice daily",
      "duration": "3 days",
      "instructions": "After meals"
    }],
    "notes": "Plenty of fluids recommended",
    "followUpDate": "2025-10-20"
  }
}
```

**Response (201):**
```json
{
  "message": "Consultation added successfully",
  "recordId": "...",
  "consultationIndex": 0
}
```

---

### PUT /api/medical-records
**Purpose:** Update medical record (allergies, chronic conditions, etc.)

**Request:**
```json
{
  "patientEmail": "patient@example.com",
  "updates": {
    "allergies": ["Penicillin", "Peanuts"],
    "chronicConditions": ["Hypertension", "Diabetes"]
  },
  "doctorId": "...",
  "doctorName": "Dr. Smith"
}
```

## Workflow

### Doctor Login → Records Page

1. **Navigate to Records**
   - Click "Records" in navigation menu
   - Redirects to `/records`

2. **Search for Patient**
   - Enter patient email in search box
   - Click "Search" or press Enter
   - System retrieves medical record from MongoDB

3. **Review Patient History**
   - View patient summary (allergies, conditions, consultation count)
   - Browse consultation history (newest first)
   - Review past diagnoses and prescriptions

4. **Add New Consultation**
   - Click "+ Add Consultation" button
   - Form expands with all fields

5. **Enter Consultation Details**
   - Record symptoms (required)
   - Add clinical observations
   - Capture vital signs
   - Add diagnoses (minimum 1 required)
   - Prescribe medications
   - Add clinical notes
   - Set follow-up date

6. **Validate and Save**
   - Click "💾 Save Consultation"
   - System validates data
   - Saves to MongoDB
   - Logs in audit trail
   - Confirmation message displayed

7. **View Updated Record**
   - New consultation appears in history
   - Patient summary updates
   - Form resets for next entry

## Security & Compliance

✅ **Authentication Required**
- Only logged-in doctors can access
- Doctor profile verified before allowing access

✅ **Audit Trail**
- Every action logged with timestamp
- Doctor ID and name recorded
- Changes tracked for accountability

✅ **Data Validation**
- Required fields enforced
- Prevents incomplete records
- Validates data types

✅ **Error Handling**
- User-friendly error messages
- Prevents data loss
- Graceful failure handling

## Benefits

🎯 **For Doctors**
- Fast access to complete patient history
- Streamlined consultation documentation
- Easy prescription management
- Time-saving interface

🏥 **For Hospitals**
- Centralized patient records
- Complete audit trail
- Data consistency
- Reduced paperwork

👥 **For Patients**
- Comprehensive medical history
- Continuity of care
- Easy record sharing across hospitals
- Secure data storage

## Future Enhancements

### Phase 2 Features
- [ ] File upload for lab reports and X-rays
- [ ] Digital signature for prescriptions
- [ ] Print/Export consultation summary
- [ ] Email prescription to patient
- [ ] SMS appointment reminders

### Phase 3 Features
- [ ] Lab test integration
- [ ] Digital health card scanning (QR code/NFC)
- [ ] Inter-hospital record sharing
- [ ] AI-powered diagnosis suggestions
- [ ] Drug interaction warnings
- [ ] Prescription refill management

## Usage Guide

### For Doctors

**Step 1: Search Patient**
```
Records → Enter patient email → Search
```

**Step 2: Review History**
```
Scroll down to see past consultations
Check allergies and chronic conditions
```

**Step 3: Add Consultation**
```
Click "+ Add Consultation"
Fill in symptoms and vital signs
Add diagnoses and prescriptions
Save
```

**Step 4: Verify**
```
New entry appears in consultation history
Success message displayed
```

### For Administrators

**Monitor Audit Logs:**
```javascript
// Query audit logs in MongoDB
db.auditlogs.find({
  entityType: 'MedicalRecord',
  action: 'UPDATE'
}).sort({ timestamp: -1 }).limit(10)
```

**Check Record Completeness:**
```javascript
// Find patients without consultations
db.medicalrecords.find({
  consultations: { $size: 0 }
})
```

## Troubleshooting

**Issue:** Patient not found
- **Solution:** Verify patient email is correct. Patient must be registered in system first.

**Issue:** Cannot save consultation
- **Solution:** Ensure symptoms and at least one diagnosis are filled.

**Issue:** Doctor profile not loading
- **Solution:** Check doctor is logged in with valid MongoDB doctor profile.

## Summary

The **Patient Record Management System** provides a comprehensive solution for:
- ✅ Searching and retrieving patient records
- ✅ Documenting consultations with full clinical details
- ✅ Managing diagnoses and prescriptions
- ✅ Maintaining complete medical history
- ✅ Ensuring accountability through audit logs
- ✅ Improving healthcare delivery quality

This system is central to the Smart Healthcare vision of paperless, efficient, and high-quality patient care in urban hospitals.
