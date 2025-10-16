import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Doctor } from "../../../../models";

// POST doctor login - verify doctor exists in MongoDB
export async function POST(req: NextRequest) {
  try {
    console.log('Doctor login attempt...');
    await dbConnect();
    console.log('Database connected');
    
    const body = await req.json().catch(() => null);
    console.log('Login request for email:', body?.email);
    
    if (!body || !body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find doctor by email in MongoDB
    const doctor = await Doctor.findOne({ email: body.email }).select('_id name email specialty userId');
    
    if (!doctor) {
      console.log('No doctor found with email:', body.email);
      return NextResponse.json({ 
        error: "No doctor account found. Please register first or contact administration." 
      }, { status: 404 });
    }

    console.log('Doctor found:', doctor._id, doctor.name);
    
    // Return doctor profile
    return NextResponse.json({
      success: true,
      doctor: {
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        userId: doctor.userId,
      }
    });
  } catch (error: any) {
    console.error('Error during doctor login:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
    });
    return NextResponse.json({ 
      error: 'Failed to verify doctor account',
      details: error.message 
    }, { status: 500 });
  }
}
