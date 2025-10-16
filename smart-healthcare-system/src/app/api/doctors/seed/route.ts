import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb";
import { Doctor } from "../../../../models";

// POST endpoint to seed additional doctors
export async function POST() {
  try {
    await dbConnect();
    
    const additionalDoctors = [
      // Cardiology
      { name: "Dr. R. Jayawardena", specialty: "Cardiologist", email: "r.jayawardena@hospital.com" },
      
      // Pediatrics
      { name: "Dr. M. Silva", specialty: "Pediatrician", email: "m.silva@hospital.com" },
      
      // Dermatology
      { name: "Dr. L. Wijesinghe", specialty: "Dermatologist", email: "l.wijesinghe@hospital.com" },
      
      // Neurology
      { name: "Dr. N. Bandara", specialty: "Neurologist", email: "n.bandara@hospital.com" },
      { name: "Dr. P. Rajapaksa", specialty: "Neurologist", email: "p.rajapaksa@hospital.com" },
      
      // Orthopedic Surgery
      { name: "Dr. T. Gunasekara", specialty: "Orthopedic Surgeon", email: "t.gunasekara@hospital.com" },
      { name: "Dr. H. Wickramasinghe", specialty: "Orthopedic Surgeon", email: "h.wickramasinghe@hospital.com" },
      
      // General Practice
      { name: "Dr. D. Rathnayake", specialty: "General Practitioner", email: "d.rathnayake@hospital.com" },
      { name: "Dr. C. Amarasinghe", specialty: "General Practitioner", email: "c.amarasinghe@hospital.com" },
      { name: "Dr. V. Dissanayake", specialty: "General Practitioner", email: "v.dissanayake@hospital.com" },
      
      // Ophthalmology
      { name: "Dr. G. Mendis", specialty: "Ophthalmologist", email: "g.mendis@hospital.com" },
      { name: "Dr. I. Hewage", specialty: "Ophthalmologist", email: "i.hewage@hospital.com" },
      
      // Psychiatry
      { name: "Dr. J. Perera", specialty: "Psychiatrist", email: "j.perera@hospital.com" },
      { name: "Dr. W. Senanayake", specialty: "Psychiatrist", email: "w.senanayake@hospital.com" },
    ];

    // Add only doctors that don't already exist (by email)
    const addedDoctors = [];
    for (const doctor of additionalDoctors) {
      const exists = await Doctor.findOne({ email: doctor.email });
      if (!exists) {
        const newDoc = await Doctor.create(doctor);
        addedDoctors.push(newDoc);
      }
    }
    
    const totalCount = await Doctor.countDocuments();
    
    return NextResponse.json({
      message: `Added ${addedDoctors.length} new doctors`,
      totalDoctors: totalCount,
      added: addedDoctors.map(d => ({ name: d.name, specialty: d.specialty }))
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error seeding doctors:', error);
    return NextResponse.json({ 
      error: 'Failed to seed doctors',
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE endpoint to reset all doctors (use with caution!)
export async function DELETE() {
  try {
    await dbConnect();
    
    const result = await Doctor.deleteMany({});
    
    return NextResponse.json({
      message: `Deleted ${result.deletedCount} doctors`,
      note: 'Visit /api/doctors to auto-seed with initial data'
    });
  } catch (error: any) {
    console.error('Error deleting doctors:', error);
    return NextResponse.json({ 
      error: 'Failed to delete doctors',
      details: error.message 
    }, { status: 500 });
  }
}
