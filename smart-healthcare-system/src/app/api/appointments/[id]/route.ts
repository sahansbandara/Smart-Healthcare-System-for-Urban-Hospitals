import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Appointment, buildTimeRange, overlaps, ZAppointmentUpdate } from '@/models';
import { mapError } from '@/lib/errors';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';

async function authenticate(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw { status: 401, body: { ok: false, error: 'UNAUTHORIZED' } };
  }
  const token = authHeader.split(' ')[1];
  return verifyFirebaseToken(token);
}

function ensureAccess(appointment: any, user: any) {
  if (!appointment) {
    return false;
  }
  if (user.isStaff) {
    return true;
  }
  return appointment.createdBy === user.uid;
}

function isPast(date: string, startTime: string) {
  const { start } = buildTimeRange(date, startTime, startTime);
  return start.getTime() < Date.now();
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request);
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
    }

    await connectDB();

    const appointment = await Appointment.findById(id).lean();

    if (!ensureAccess(appointment, user)) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: appointment }, { status: 200 });
  } catch (error) {
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request);
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
    }

    await connectDB();

    const appointment = await Appointment.findById(id);

    if (!appointment || !ensureAccess(appointment, user)) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    const payload = await request.json();
    const parsed = ZAppointmentUpdate.safeParse(payload);

    if (!parsed.success) {
      throw parsed.error;
    }

    const updates = parsed.data;

    const nextDate = updates.date ?? appointment.date;
    const nextStart = updates.startTime ?? appointment.startTime;
    const nextEnd = updates.endTime ?? appointment.endTime;

    if (isPast(nextDate, nextStart)) {
      return NextResponse.json({ ok: false, error: 'PAST_DATE' }, { status: 400 });
    }

    let statusOverride = updates.status ?? appointment.status;

    if (updates.date || updates.startTime || updates.endTime) {
      const { start, end } = buildTimeRange(nextDate, nextStart, nextEnd);
      const conflicts = await Appointment.find({
        doctorId: appointment.doctorId,
        date: nextDate,
        _id: { $ne: appointment._id },
        status: { $ne: 'CANCELLED' },
      });

      for (const conflict of conflicts) {
        const range = buildTimeRange(conflict.date, conflict.startTime, conflict.endTime);
        if (overlaps(start, end, range.start, range.end)) {
          return NextResponse.json({ ok: false, error: 'CONFLICT_SLOT' }, { status: 409 });
        }
      }

      appointment.date = nextDate;
      appointment.startTime = nextStart;
      appointment.endTime = nextEnd;
      statusOverride = updates.status ?? 'RESCHEDULED';
    }

    if (updates.reason) {
      appointment.reason = updates.reason;
    }

    appointment.status = statusOverride;

    if (statusOverride === 'CANCELLED') {
      appointment.cancelledAt = new Date();
    }

    await appointment.save();

    return NextResponse.json({ ok: true, data: appointment }, { status: 200 });
  } catch (error) {
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(request);
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ ok: false, error: 'INVALID_ID' }, { status: 400 });
    }

    await connectDB();

    const appointment = await Appointment.findById(id);

    if (!appointment || !ensureAccess(appointment, user)) {
      return NextResponse.json({ ok: false, error: 'NOT_FOUND' }, { status: 404 });
    }

    appointment.status = 'CANCELLED';
    appointment.cancelledAt = new Date();

    await appointment.save();

    return NextResponse.json({ ok: true, data: appointment }, { status: 200 });
  } catch (error) {
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
