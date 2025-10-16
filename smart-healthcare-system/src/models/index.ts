import { Schema, model, models, type InferSchemaType } from 'mongoose';
import { z } from 'zod';
import { isFutureDate, isHHmm, isNonEmptyTrimmed } from '@/lib/validators';

const objectIdPattern = /^[a-f\d]{24}$/i;
export const ZObjectId = z
  .string()
  .regex(objectIdPattern, { message: 'Invalid ObjectId' });

const WorkingHourSchema = new Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const DoctorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    slotsPerHour: { type: Number, min: 1, max: 12 },
    workingHours: { type: [WorkingHourSchema], default: [] },
    offDays: { type: [String], default: [] },
  },
  { timestamps: true }
);

const PatientSchema = new Schema(
  {
    uid: { type: String, required: true, index: true, unique: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const AppointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    reason: { type: String, required: true, trim: true, maxlength: 200 },
    status: {
      type: String,
      enum: ['BOOKED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'],
      default: 'BOOKED',
      required: true,
    },
    createdBy: { type: String, required: true },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

export const Doctor = models.Doctor || model('Doctor', DoctorSchema);
export const Patient = models.Patient || model('Patient', PatientSchema);
export const Appointment = models.Appointment || model('Appointment', AppointmentSchema);

export type DoctorDocument = InferSchemaType<typeof DoctorSchema>;
export type PatientDocument = InferSchemaType<typeof PatientSchema>;
export type AppointmentDocument = InferSchemaType<typeof AppointmentSchema>;

export function buildTimeRange(
  date: string,
  startTime: string,
  endTime: string
): { start: Date; end: Date } {
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);
  const start = new Date(base);
  start.setHours(startHours, startMinutes, 0, 0);
  const end = new Date(base);
  end.setHours(endHours, endMinutes, 0, 0);
  return { start, end };
}

export function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

const ZTime = z.string().refine(isHHmm, 'Invalid time format');

const baseAppointmentShape = {
  patientId: ZObjectId,
  doctorId: ZObjectId,
  date: z
    .string()
    .trim()
    .refine((value) => isFutureDate(value, true), {
      message: 'Date must be today or in the future',
    }),
  startTime: ZTime,
  endTime: ZTime,
  reason: isNonEmptyTrimmed(z.string().max(200)),
};

export const ZAppointmentCreate = z
  .object(baseAppointmentShape)
  .superRefine((data, ctx) => {
    const { start, end } = buildTimeRange(data.date, data.startTime, data.endTime);
    if (end <= start) {
      ctx.addIssue({
        path: ['endTime'],
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
      });
    }
  });

export const ZAppointmentUpdate = z
  .object({
    date: baseAppointmentShape.date.optional(),
    startTime: baseAppointmentShape.startTime.optional(),
    endTime: baseAppointmentShape.endTime.optional(),
    reason: baseAppointmentShape.reason.optional(),
    status: z
      .enum(['BOOKED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED'])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one field must be provided',
        path: [],
      });
    }

    if (data.startTime && data.endTime) {
      const [startHour, startMinute] = data.startTime.split(':').map(Number);
      const [endHour, endMinute] = data.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      if (endMinutes <= startMinutes) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be after start time',
          path: ['endTime'],
        });
      }
    }
  });

export const ZAppointmentQuery = z
  .object({
    doctorId: ZObjectId.optional(),
    patientId: ZObjectId.optional(),
    status: z.enum(['BOOKED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED']).optional(),
    from: z
      .string()
      .trim()
      .refine((value) => (value ? isFutureDate(value, false) : true), {
        message: 'Invalid from date',
      })
      .optional(),
    to: z
      .string()
      .trim()
      .refine((value) => (value ? isFutureDate(value, false) : true), {
        message: 'Invalid to date',
      })
      .optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .refine(
    (value) => {
      if (value.from && value.to) {
        return new Date(value.from) <= new Date(value.to);
      }
      return true;
    },
    {
      message: 'from must be before to',
      path: ['to'],
    }
  );

export type AppointmentCreateInput = z.infer<typeof ZAppointmentCreate>;
export type AppointmentUpdateInput = z.infer<typeof ZAppointmentUpdate>;
export type AppointmentQueryInput = z.infer<typeof ZAppointmentQuery>;
