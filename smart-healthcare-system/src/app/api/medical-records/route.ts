import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { MedicalRecord, Patient, AuditLog } from "../../../models";

// GET - Fetch patient's medical record by email or patient ID
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const patientId = searchParams.get('patientId');
    
    if (!email && !patientId) {
      return NextResponse.json({ error: "Email or Patient ID required" }, { status: 400 });
    }

    const query = email ? { patientEmail: email } : { patientId };
    const record = await MedicalRecord.findOne(query)
      .populate('consultations.doctorId', 'name specialty')
      .lean();
    
    if (!record) {
      // If no record exists, check if patient exists and create skeleton record
      const patient = email 
        ? await Patient.findOne({ email })
        : await Patient.findById(patientId);
      
      if (!patient) {
        return NextResponse.json({ error: "Patient not found" }, { status: 404 });
      }

      // Return empty record structure
      return NextResponse.json({
        patientId: patient._id.toString(),
        patientEmail: patient.email,
        patientName: patient.name,
        consultations: [],
        allergies: [],
        chronicConditions: [],
        surgicalHistory: [],
        familyHistory: [],
      });
    }
    
    return NextResponse.json({
      ...(record as any),
      _id: (record as any)._id.toString(),
      patientId: (record as any).patientId.toString(),
    });
  } catch (error: any) {
    console.error('Error fetching medical record:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch medical record',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Add new consultation to patient's medical record
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    console.log('Add consultation request:', body);
    
    const { patientEmail, doctorId, doctorName, consultation } = body;
    
    if (!patientEmail || !doctorId || !doctorName || !consultation) {
      return NextResponse.json({ 
        error: "Missing required fields: patientEmail, doctorId, doctorName, consultation" 
      }, { status: 400 });
    }

    // Validate consultation data
    if (!consultation.symptoms && !consultation.observations) {
      return NextResponse.json({ 
        error: "Consultation must include symptoms or observations" 
      }, { status: 400 });
    }

    // Find patient
    const patient = await Patient.findOne({ email: patientEmail });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Find or create medical record
    let record = await MedicalRecord.findOne({ patientEmail });
    
    if (!record) {
      record = new MedicalRecord({
        patientId: patient._id,
        patientEmail: patient.email,
        patientName: patient.name,
        consultations: [],
        allergies: [],
        chronicConditions: [],
      });
    }

    // Add new consultation
    const newConsultation = {
      date: new Date(),
      doctorId,
      doctorName,
      ...consultation,
    };

    record.consultations.push(newConsultation);
    await record.save();

    // Log audit trail
    await AuditLog.create({
      action: 'UPDATE',
      entityType: 'MedicalRecord',
      entityId: record._id,
      performedBy: {
        userId: doctorId,
        userName: doctorName,
        userRole: 'Doctor',
      },
      changes: {
        action: 'Added consultation',
        consultationDate: newConsultation.date,
      },
    });

    console.log('Consultation added successfully');
    return NextResponse.json({
      message: 'Consultation added successfully',
      recordId: record._id.toString(),
      consultationIndex: record.consultations.length - 1,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding consultation:', error);
    return NextResponse.json({ 
      error: 'Failed to add consultation',
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Update existing medical record (allergies, chronic conditions, etc.)
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json();
    const { patientEmail, updates, doctorId, doctorName } = body;
    
    if (!patientEmail || !updates) {
      return NextResponse.json({ 
        error: "Missing required fields: patientEmail, updates" 
      }, { status: 400 });
    }

    const record = await MedicalRecord.findOneAndUpdate(
      { patientEmail },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!record) {
      return NextResponse.json({ error: "Medical record not found" }, { status: 404 });
    }

    // Log audit trail
    if (doctorId && doctorName) {
      await AuditLog.create({
        action: 'UPDATE',
        entityType: 'MedicalRecord',
        entityId: record._id,
        performedBy: {
          userId: doctorId,
          userName: doctorName,
          userRole: 'Doctor',
        },
        changes: updates,
      });
    }

    return NextResponse.json({
      message: 'Medical record updated successfully',
      record,
    });
  } catch (error: any) {
    console.error('Error updating medical record:', error);
    return NextResponse.json({ 
      error: 'Failed to update medical record',
      details: error.message 
    }, { status: 500 });
  }
}
