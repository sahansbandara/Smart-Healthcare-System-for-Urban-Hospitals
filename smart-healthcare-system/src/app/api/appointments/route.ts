import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import { Appointment, Doctor } from "../../../models";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get query params for filtering
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const doctorId = searchParams.get('doctorId');
    
    const filter: any = {};
    if (email) {
      filter.patientEmail = email;
    }
    if (doctorId) {
      filter.doctorId = doctorId;
    }
    
    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialty')
      .sort({ date: 1 });
    
    // Transform to match frontend expectations
    const appointmentsWithId = appointments.map(appt => ({
      id: appt._id.toString(),
      doctorId: appt.doctorId._id.toString(),
      patientName: appt.patientName,
      patientEmail: appt.patientEmail,
      date: appt.date.toISOString(),
      reason: appt.reason || '',
    }));
    
    return NextResponse.json(appointmentsWithId);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    const body = await req.json().catch(() => null);
    if (!body || !body.doctorId || !body.patientName || !body.date || !body.patientEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(body.doctorId);
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const appointment = new Appointment({
      doctorId: body.doctorId,
      patientName: String(body.patientName),
      patientEmail: String(body.patientEmail),
      date: new Date(body.date),
      reason: body.reason ? String(body.reason) : '',
    });

    const savedAppointment = await appointment.save();
    
    // Return appointment with id as string for frontend compatibility
    const responseData = {
      id: savedAppointment._id.toString(),
      doctorId: savedAppointment.doctorId.toString(),
      patientName: savedAppointment.patientName,
      patientEmail: savedAppointment.patientEmail,
      date: savedAppointment.date.toISOString(),
      reason: savedAppointment.reason || '',
    };
    
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
