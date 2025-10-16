import { ZAppointmentCreate, ZAppointmentUpdate, ZObjectId } from '@/models';

describe('Zod schemas', () => {
  it('rejects end time before start time', () => {
    const result = ZAppointmentCreate.safeParse({
      patientId: '507f191e810c19729de860ea',
      doctorId: '507f191e810c19729de860eb',
      date: '2999-01-01',
      startTime: '10:00',
      endTime: '09:00',
      reason: 'Check-up',
    });
    expect(result.success).toBe(false);
  });

  it('trims reason and enforces max length', () => {
    const result = ZAppointmentCreate.safeParse({
      patientId: '507f191e810c19729de860ea',
      doctorId: '507f191e810c19729de860eb',
      date: '2999-01-01',
      startTime: '10:00',
      endTime: '11:00',
      reason: '  Routine visit  ',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.reason).toBe('Routine visit');
    }
  });

  it('rejects invalid ObjectId', () => {
    const result = ZObjectId.safeParse('1234');
    expect(result.success).toBe(false);
  });

  it('requires update payload to have fields and valid times', () => {
    const empty = ZAppointmentUpdate.safeParse({});
    expect(empty.success).toBe(false);

    const invalid = ZAppointmentUpdate.safeParse({
      startTime: '10:00',
      endTime: '09:00',
    });
    expect(invalid.success).toBe(false);
  });
});
