import { z } from 'zod';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const hhmmPattern = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isFutureDate(value: string, allowToday = false): boolean {
  if (!isoDatePattern.test(value)) {
    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  date.setHours(0, 0, 0, 0);
  return allowToday ? date >= today : date > today;
}

export function isHHmm(value: string): boolean {
  return hhmmPattern.test(value);
}

export function isNonEmptyTrimmed<T extends z.ZodString>(schema: T): T {
  return schema.transform((val) => val.trim()).refine((val) => val.length > 0, {
    message: 'Required',
  }) as T;
}

export function composeSharedSchema<T extends z.ZodTypeAny>(schema: T) {
  return {
    client: schema,
    server: schema,
  };
}
