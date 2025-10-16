import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Doctor } from "../../../../models";

// GET doctor profile by email
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    
    const doctor = await Doctor.findOne({ email }).select('_id name email specialty');
    
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: doctor._id.toString(),
      name: doctor.name,
      email: doctor.email,
      specialty: doctor.specialty,
    });
  } catch (error) {
    console.error('Error fetching doctor profile:', error);
    return NextResponse.json({ error: 'Failed to fetch doctor profile' }, { status: 500 });
  }
}

// POST create doctor profile
export async function POST(req: NextRequest) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    console.log('Database connected');
    
    const body = await req.json().catch(() => null);
    console.log('Request body:', body);
    
    if (!body || !body.name || !body.email || !body.specialty) {
      console.error('Missing required fields:', { body });
      return NextResponse.json({ error: "Missing required fields (name, email, specialty)" }, { status: 400 });
    }

    // Check if doctor already exists
    console.log('Checking for existing doctor with email:', body.email);
    const existing = await Doctor.findOne({ email: body.email });
    if (existing) {
      console.log('Doctor already exists:', existing._id);
      return NextResponse.json({ error: "Doctor account already exists" }, { status: 409 });
    }

    console.log('Creating new doctor profile...');
    const doctor = new Doctor({
      name: body.name,
      email: body.email,
      specialty: body.specialty,
      userId: body.userId || null,
    });

    console.log('Saving doctor to database...');
    const savedDoctor = await doctor.save();
    console.log('Doctor saved successfully:', savedDoctor._id);
    
    return NextResponse.json({
      id: savedDoctor._id.toString(),
      name: savedDoctor.name,
      email: savedDoctor.email,
      specialty: savedDoctor.specialty,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating doctor profile:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({ 
      error: 'Failed to create doctor profile',
      details: error.message 
    }, { status: 500 });
  }
}
