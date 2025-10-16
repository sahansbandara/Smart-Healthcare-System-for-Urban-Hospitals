import mongoose from 'mongoose';

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  specialty: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // Allows null values to be non-unique
  },
  userId: {
    type: String, // Firebase UID
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  patientEmail: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  address: {
    type: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  digitalHealthCardId: {
    type: String,
    unique: true,
    sparse: true,
  },
}, {
  timestamps: true,
});

// Medical Record Schema
const MedicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  patientEmail: {
    type: String,
    required: true,
  },
  patientName: {
    type: String,
    required: true,
  },
  consultations: [{
    date: { type: Date, required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    doctorName: { type: String, required: true },
    symptoms: { type: String },
    observations: { type: String },
    vitalSigns: {
      bloodPressure: String,
      temperature: String,
      heartRate: String,
      weight: String,
      height: String,
    },
    diagnoses: [{
      condition: { type: String, required: true },
      severity: { type: String, enum: ['Mild', 'Moderate', 'Severe'] },
      notes: String,
    }],
    prescriptions: [{
      medicineName: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
      duration: { type: String, required: true },
      instructions: String,
    }],
    labTests: [{
      testName: String,
      status: { type: String, enum: ['Ordered', 'Completed', 'Pending'] },
      results: String,
      attachmentUrl: String,
    }],
    attachments: [{
      fileName: String,
      fileType: String,
      uploadDate: Date,
      url: String,
      description: String,
    }],
    followUpDate: Date,
    notes: String,
  }],
  allergies: [String],
  chronicConditions: [String],
  surgicalHistory: [{
    procedure: String,
    date: Date,
    hospital: String,
    surgeon: String,
  }],
  familyHistory: [{
    relation: String,
    condition: String,
  }],
}, {
  timestamps: true,
});

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'VIEW', 'DELETE'],
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Patient', 'MedicalRecord', 'Appointment', 'Doctor'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  performedBy: {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, enum: ['Doctor', 'Nurse', 'Admin', 'Patient'] },
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // Store what changed
  },
  ipAddress: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', DoctorSchema);
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);
export const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
export const MedicalRecord = mongoose.models.MedicalRecord || mongoose.model('MedicalRecord', MedicalRecordSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);