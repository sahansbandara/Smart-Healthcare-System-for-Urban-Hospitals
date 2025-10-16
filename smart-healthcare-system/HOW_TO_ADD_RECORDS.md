# 📋 How to Add Patient Records

## Step-by-Step Guide

### 1️⃣ Login as a Doctor
- Go to: http://localhost:3000/doctor/login
- Use your doctor email and password
- Or register a new doctor account

### 2️⃣ Navigate to Patient Records
**Three ways to access:**
- Click the **"📋 Patient Records"** button in the navbar (top right)
- Click the **"Patient Records"** card on the doctor dashboard
- Go directly to: http://localhost:3000/doctor/records

### 3️⃣ Find a Patient (Two Methods)

#### **Method 1: Select from Patient List (Recommended)** 📋
1. The default mode is **"Select from List"**
2. Click the dropdown menu
3. You'll see all patients who have booked appointments:
   - Shows patient name and email
   - Easy to browse and select
4. Click **"Load Records"** button
5. ✅ Patient records loaded!

#### **Method 2: Search by Email** ✉️
1. Click **"Search by Email"** tab
2. Enter the patient's email address (e.g., `patient@example.com`)
3. Click **"Search"** button (or press Enter)
4. ✅ Patient records loaded!

**The system will:**
- Find the patient in the database
- Load their medical record (or create an empty one if it doesn't exist)
- Display patient summary

### 4️⃣ Add a New Consultation
Once you've found a patient:

1. Click **"+ Add Consultation"** button
2. Fill out the consultation form:

#### Required Fields:
- **Symptoms*** - Patient complaints (e.g., "Fever, headache, body ache")
- **At least 1 Diagnosis*** - Condition name and severity

#### Optional Fields:
- **Observations** - Clinical observations
- **Vital Signs**:
  - Blood Pressure (e.g., "120/80")
  - Temperature (e.g., "98.6°F")
  - Heart Rate (e.g., "72 bpm")
  - Weight (e.g., "70 kg")
  - Height (e.g., "175 cm")

#### Diagnoses Section:
- **Condition** - Disease/condition name (e.g., "Viral Fever")
- **Severity** - Mild / Moderate / Severe
- **Notes** - Additional diagnosis notes
- Click **"+ Add Diagnosis"** to add multiple diagnoses

#### Prescriptions Section:
- **Medicine Name** (e.g., "Paracetamol")
- **Dosage** (e.g., "500mg")
- **Frequency** (e.g., "Twice daily")
- **Duration** (e.g., "5 days")
- **Instructions** (e.g., "Take after meals")
- Click **"+ Add Medicine"** to add multiple prescriptions

#### Additional Information:
- **Additional Notes** - Any extra clinical notes
- **Follow-up Date** - Schedule next appointment

3. Click **"💾 Save Consultation"**

### 5️⃣ View Consultation History
- After saving, the consultation appears in the **"📜 Consultation History"** section
- All consultations are listed in reverse chronological order (newest first)
- Each entry shows:
  - Doctor name and date/time
  - Symptoms and diagnoses
  - Prescriptions
  - Notes

---

## 🧪 Testing with Sample Data

### Quick Test - Select Patient from List:
1. Make sure you have patients who booked appointments
   - If not, register a patient at http://localhost:3000/register
   - Login as patient and book an appointment
2. Login as doctor at http://localhost:3000/doctor/login
3. Go to Patient Records at http://localhost:3000/doctor/records
4. **Select patient from dropdown** (default mode)
5. Click "Load Records"
6. ✅ Patient info appears!

### Create a Test Patient:
1. Go to: http://localhost:3000/register
2. Register a new patient account (e.g., `testpatient@example.com`)
3. Login and book an appointment with any doctor
4. This creates the patient in the database

### Add First Record:
1. Login as doctor
2. Search for: `testpatient@example.com`
3. Add a sample consultation:
   - **Symptoms:** "Fever and cough for 3 days"
   - **Diagnosis:** "Upper Respiratory Infection" (Moderate)
   - **Prescription:** "Amoxicillin 500mg, Twice daily, 7 days"
   - **Notes:** "Drink plenty of fluids"
   - **Follow-up:** 7 days from today

---

## 📊 Example Consultation

### Sample Data to Copy:
```
Symptoms: Fever (102°F), persistent cough, fatigue

Vital Signs:
- BP: 120/80
- Temp: 102°F
- Heart Rate: 88 bpm
- Weight: 68 kg
- Height: 170 cm

Diagnosis 1:
- Condition: Acute Bronchitis
- Severity: Moderate
- Notes: Productive cough with yellowish sputum

Prescription 1:
- Medicine: Azithromycin
- Dosage: 500mg
- Frequency: Once daily
- Duration: 3 days
- Instructions: Take with food

Prescription 2:
- Medicine: Dextromethorphan
- Dosage: 10ml
- Frequency: Three times daily
- Duration: 5 days
- Instructions: For cough relief

Notes: Patient advised to rest, increase fluid intake, and avoid cold beverages. Return if symptoms worsen.

Follow-up: 5 days from today
```

---

## 🔍 Troubleshooting

### "No patients in dropdown list"
- Patients appear in the list only if they've booked appointments
- **Solution:** Have patients book appointments first
- Or use "Search by Email" mode to find any patient

### "Patient not found" (Email search)
- Make sure the patient has registered an account first
- Check the email spelling
- Patient must exist in the database

### "Select from List" shows wrong patients
- The list shows all patients who have booked appointments
- Use "Search by Email" for patients who haven't booked yet

### Form won't save
- Check that **Symptoms** field is filled
- Ensure at least **one Diagnosis** is added
- The diagnosis **Condition** field must not be empty

### Can't see history
- Make sure you saved the consultation successfully
- Refresh the page
- Try searching for the patient again

---

## 🎯 Quick Access

- **Doctor Login:** http://localhost:3000/doctor/login
- **Patient Records:** http://localhost:3000/doctor/records
- **Patient Registration:** http://localhost:3000/register

---

## 💡 Tips

1. **Use "Select from List" for convenience** - Faster than typing emails
2. **Use "Search by Email" for new patients** - Patients who haven't booked yet
3. **Patient dropdown shows:** Name and email for easy identification
4. **Save frequently** - Each consultation is saved independently
5. **Add multiple diagnoses** - Use the "+ Add Diagnosis" button for complex cases
6. **Detailed prescriptions** - Include all medication details for patient safety
7. **Follow-up dates** - Schedule appointments for continuity of care
8. **Audit trail** - All actions are automatically logged for accountability

---

Need help? Check the full documentation in `PATIENT_RECORDS.md`
