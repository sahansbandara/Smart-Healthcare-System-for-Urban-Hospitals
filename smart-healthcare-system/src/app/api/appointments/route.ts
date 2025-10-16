import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/mongodb';
import { Appointment, buildTimeRange, overlaps, ZAppointmentCreate, ZAppointmentQuery } from '@/models';
import { mapError } from '@/lib/errors';
import { verifyFirebaseToken } from '@/lib/firebaseAdmin';

async function authenticate(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw { status: 401, body: { ok: false, error: 'UNAUTHORIZED' } };
  }
  const token = authHeader.split(' ')[1];
  const decoded = await verifyFirebaseToken(token);
  return decoded;
}

function isPastRange(date: string, startTime: string) {
  const { start } = buildTimeRange(date, startTime, startTime);
  return start.getTime() < Date.now();
}

export async function GET(request: Request) {
  try {
    const user = await authenticate(request);
    await connectDB();

    const url = new URL(request.url);
    const search = Object.fromEntries(url.searchParams.entries());
    const result = ZAppointmentQuery.safeParse(search);

    if (!result.success) {
      throw result.error;
    }

    const { doctorId, patientId, status, from, to, page, limit } = result.data;

    const query: Record<string, unknown> = {};

    if (!user.isStaff) {
      query.createdBy = user.uid;
    }

    if (doctorId) {
      query.doctorId = new Types.ObjectId(doctorId);
    }

    if (patientId) {
      query.patientId = new Types.ObjectId(patientId);
    }

    if (status) {
      query.status = status;
    }

    if (from || to) {
      query.date = {};
      if (from) {
        (query.date as Record<string, unknown>)["$gte"] = from;
      }
      if (to) {
        (query.date as Record<string, unknown>)["$lte"] = to;
      }
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Appointment.find(query)
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Appointment.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        ok: true,
        data: {
          items,
          page,
          total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticate(request);
    await connectDB();

    const payload = await request.json();
    const parsed = ZAppointmentCreate.safeParse(payload);

    if (!parsed.success) {
      throw parsed.error;
    }

    const { doctorId, patientId, date, startTime, endTime, reason } = parsed.data;

    if (isPastRange(date, startTime)) {
      return NextResponse.json(
        { ok: false, error: 'PAST_DATE' },
        { status: 400 }
      );
    }

    const { start, end } = buildTimeRange(date, startTime, endTime);

    const conflicts = await Appointment.find({
      doctorId: new Types.ObjectId(doctorId),
      date,
      status: { $ne: 'CANCELLED' },
    });

    for (const conflict of conflicts) {
      const existing = buildTimeRange(conflict.date, conflict.startTime, conflict.endTime);
      if (overlaps(start, end, existing.start, existing.end)) {
        return NextResponse.json(
          { ok: false, error: 'CONFLICT_SLOT' },
          { status: 409 }
        );
      }
    }

    const appointment = new Appointment({
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
      date,
      startTime,
      endTime,
      reason,
      status: 'BOOKED',
      createdBy: user.uid,
    });

    await appointment.save();

    return NextResponse.json(
      { ok: true, data: appointment },
      { status: 201 }
    );
  } catch (error) {
    const mapped = mapError(error);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}
