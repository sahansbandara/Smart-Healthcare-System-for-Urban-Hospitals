import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Appointment, Doctor, buildTimeRange, overlaps } from '@/models';
import { mapError } from '@/lib/errors';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function getDayKey(date: string) {
  const day = new Date(date);
  return day.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const doctorId = params.id;
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date || !isoDatePattern.test(date)) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_DATE' },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json(
        { ok: false, error: 'INVALID_DOCTOR' },
        { status: 400 }
      );
    }

    await connectDB();

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor) {
      return NextResponse.json(
        { ok: false, error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const dayKey = getDayKey(date);

    if (doctor.offDays?.map((d: string) => d.toLowerCase()).includes(dayKey)) {
      return NextResponse.json({ ok: true, data: { slots: [] } }, { status: 200 });
    }

    const workingBlocks = (doctor.workingHours || []).filter(
      (block: { day: string }) => block.day.toLowerCase() === dayKey
    );

    if (workingBlocks.length === 0) {
      return NextResponse.json({ ok: true, data: { slots: [] } }, { status: 200 });
    }

    const appointments = await Appointment.find({
      doctorId: new Types.ObjectId(doctorId),
      date,
      status: { $ne: 'CANCELLED' },
    }).lean();

    const slotInterval = doctor.slotsPerHour ? Math.round(60 / doctor.slotsPerHour) : 15;
    const takenRanges = appointments.map((appt) =>
      buildTimeRange(appt.date, appt.startTime, appt.endTime)
    );

    const slots: string[] = [];

    for (const block of workingBlocks) {
      const startMinutes = toMinutes(block.startTime);
      const endMinutes = toMinutes(block.endTime);

      for (let cursor = startMinutes; cursor + slotInterval <= endMinutes; cursor += slotInterval) {
        const slotStart = minutesToTime(cursor);
        const slotEnd = minutesToTime(cursor + slotInterval);
        const { start, end } = buildTimeRange(date, slotStart, slotEnd);

        const hasConflict = takenRanges.some((range) => overlaps(start, end, range.start, range.end));
        if (!hasConflict) {
          slots.push(slotStart);
        }
      }
    }

    return NextResponse.json({ ok: true, data: { slots } }, { status: 200 });
  } catch (error) {
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
