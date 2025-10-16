import { Suspense } from 'react';
import connectDB from '@/lib/mongodb';
import { Doctor } from '@/models';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { AppointmentTable } from '@/components/appointments/AppointmentTable';

async function getDoctors() {
  await connectDB();
  const doctors = await Doctor.find({}, { name: 1, department: 1 }).lean();
  return doctors.map((doctor) => ({
    id: doctor._id.toString(),
    name: doctor.name,
    department: doctor.department,
  }));
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
      <div className="h-48 w-full animate-pulse rounded bg-gray-200" />
    </div>
  );
}

export default async function AppointmentsPage() {
  const doctors = await getDoctors();

  return (
    <div className="space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Book Appointment</h1>
        <p className="text-sm text-gray-600">
          Create and manage your appointments. Availability updates in real time to prevent double bookings.
        </p>
      </header>

      <section className="rounded border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">New appointment</h2>
        <p className="mb-4 text-sm text-gray-600">
          Fill in the form below to book a new appointment.
        </p>
        <AppointmentForm doctors={doctors} />
      </section>

      <section className="rounded border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Upcoming appointments</h2>
        <Suspense fallback={<TableSkeleton />}>
          <AppointmentTable />
        </Suspense>
      </section>
    </div>
  );
}
