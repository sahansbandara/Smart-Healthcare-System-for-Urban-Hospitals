import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

jest.mock('@/lib/firebaseAdmin', () => ({
  verifyFirebaseToken: jest.fn(),
}));

const verifyFirebaseToken = jest.requireMock('@/lib/firebaseAdmin').verifyFirebaseToken as jest.Mock;

let mongo: MongoMemoryServer;
let appointmentsRoute: typeof import('@/app/api/appointments/route');
let appointmentDetailRoute: typeof import('@/app/api/appointments/[id]/route');
let models: typeof import('@/models');

function authHeaders() {
  return new Headers({ authorization: 'Bearer token' });
}

function createRequest(url: string, init: RequestInit & { json?: unknown } = {}) {
  const { json, ...rest } = init;
  const headers = new Headers(rest.headers || {});
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  return new Request(url, {
    ...rest,
    headers,
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  appointmentsRoute = await import('@/app/api/appointments/route');
  appointmentDetailRoute = await import('@/app/api/appointments/[id]/route');
  models = await import('@/models');
  verifyFirebaseToken.mockResolvedValue({ uid: 'user-1', isStaff: true });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('Appointments API', () => {
  let doctorId: string;
  let patientId: string;
  let appointmentId: string;

  beforeAll(async () => {
    await models.Doctor.deleteMany({});
    await models.Patient.deleteMany({});
    await models.Appointment.deleteMany({});

    const doctor = await models.Doctor.create({
      name: 'Dr. Who',
      department: 'General',
      workingHours: [
        { day: 'monday', startTime: '09:00', endTime: '17:00' },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00' },
      ],
    });
    const patient = await models.Patient.create({
      uid: 'user-1',
      name: 'Patient Zero',
      phone: '1234567890',
      email: 'patient@example.com',
    });

    doctorId = doctor._id.toString();
    patientId = patient._id.toString();
  });

  it('creates a valid appointment', async () => {
    const res = await appointmentsRoute.POST(
      createRequest('http://localhost/api/appointments', {
        method: 'POST',
        headers: authHeaders(),
        json: {
          patientId,
          doctorId,
          date: '2999-01-01',
          startTime: '10:00',
          endTime: '11:00',
          reason: 'Routine check',
        },
      })
    );

    expect(res.status).toBe(201);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
    appointmentId = body.data._id;
  });

  it('rejects past dates', async () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const res = await appointmentsRoute.POST(
      createRequest('http://localhost/api/appointments', {
        method: 'POST',
        headers: authHeaders(),
        json: {
          patientId,
          doctorId,
          date: yesterday,
          startTime: '09:00',
          endTime: '10:00',
          reason: 'Late booking',
        },
      })
    );

    expect(res.status).toBe(400);
  });

  it('prevents overlapping bookings', async () => {
    const res = await appointmentsRoute.POST(
      createRequest('http://localhost/api/appointments', {
        method: 'POST',
        headers: authHeaders(),
        json: {
          patientId,
          doctorId,
          date: '2999-01-01',
          startTime: '10:30',
          endTime: '11:30',
          reason: 'Conflict',
        },
      })
    );

    expect(res.status).toBe(409);
  });

  it('lists appointments with pagination', async () => {
    const res = await appointmentsRoute.GET(
      createRequest(`http://localhost/api/appointments?doctorId=${doctorId}&page=1&limit=10`, {
        method: 'GET',
        headers: authHeaders(),
      })
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.data.items).toHaveLength(1);
    expect(body.data.total).toBe(1);
  });

  it('reschedules with conflict checks', async () => {
    const other = await models.Appointment.create({
      patientId: new mongoose.Types.ObjectId(),
      doctorId: new mongoose.Types.ObjectId(doctorId),
      date: '2999-01-02',
      startTime: '09:00',
      endTime: '10:00',
      reason: 'Hold',
      status: 'BOOKED',
      createdBy: 'staff',
    });

    // Conflict attempt
    const conflictRes = await appointmentDetailRoute.PATCH(
      createRequest(`http://localhost/api/appointments/${other._id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        json: {
          date: '2999-01-02',
          startTime: '09:30',
          endTime: '10:30',
        },
      }),
      { params: { id: other._id.toString() } }
    );
    expect(conflictRes.status).toBe(409);

    const res = await appointmentDetailRoute.PATCH(
      createRequest(`http://localhost/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: authHeaders(),
        json: {
          date: '2999-01-02',
          startTime: '11:00',
          endTime: '12:00',
        },
      }),
      { params: { id: appointmentId } }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.data.status).toBe('RESCHEDULED');
  });

  it('soft deletes appointments', async () => {
    const res = await appointmentDetailRoute.DELETE(
      createRequest(`http://localhost/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      }),
      { params: { id: appointmentId } }
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.data.status).toBe('CANCELLED');
  });
});
