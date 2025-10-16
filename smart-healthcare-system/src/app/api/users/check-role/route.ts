import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Doctor, Patient } from "@/models";

// GET /api/users/check-role?email=xxx
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    // Check if user is a doctor
    const doctor = await Doctor.findOne({ email }).lean();
    if (doctor) {
      return NextResponse.json({
        role: "doctor",
        user: {
          id: (doctor as any)._id.toString(),
          name: (doctor as any).name,
          email: (doctor as any).email,
          specialty: (doctor as any).specialty,
        },
      });
    }

    // Check if user is a patient
    const patient = await Patient.findOne({ email }).lean();
    if (patient) {
      return NextResponse.json({
        role: "patient",
        user: {
          email: (patient as any).email,
          name: (patient as any).name,
        },
      });
    }

    // User not found in database
    return NextResponse.json({
      role: "unknown",
      message: "User not found. Please register first.",
    }, { status: 404 });

  } catch (error: any) {
    console.error("Error checking user role:", error);
    return NextResponse.json(
      { error: "Failed to check user role" },
      { status: 500 }
    );
  }
}
