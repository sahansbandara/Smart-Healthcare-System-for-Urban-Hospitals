"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ZAppointmentCreate } from "@/models";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type AppointmentSummary = {
  _id: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
};

type RescheduleDialogProps = {
  appointment: AppointmentSummary | null;
  onClose: () => void;
  onSuccess: () => void;
};

const FormSchema = ZAppointmentCreate.pick({
  date: true,
  startTime: true,
  endTime: true,
  reason: true,
}).extend({
  reason: ZAppointmentCreate.shape.reason.optional(),
});

type FormValues = z.infer<typeof FormSchema>;

type ToastState = {
  message: string;
  tone: "success" | "error";
};

export function RescheduleDialog({ appointment, onClose, onSuccess }: RescheduleDialogProps) {
  const { getIdToken } = useAuth();
  const [slots, setSlots] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const isOpen = Boolean(appointment);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: appointment?.date ?? "",
      startTime: appointment?.startTime ?? "",
      endTime: appointment?.endTime ?? "",
      reason: appointment?.reason ?? "",
    },
  });

  useEffect(() => {
    if (appointment) {
      reset({
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        reason: appointment.reason,
      });
    }
  }, [appointment, reset]);

  const date = watch("date");

  useEffect(() => {
    if (!appointment || !date) {
      setSlots([]);
      return;
    }

    let ignore = false;
    async function fetchAvailability() {
      setLoadingSlots(true);
      try {
        const response = await apiFetch<{ slots: string[] }>(
          `/api/doctors/${appointment.doctorId}/availability?date=${date}`,
          { getIdToken }
        );
        if (!ignore) {
          setSlots(response.data.slots);
        }
      } catch (error) {
        if (!ignore) {
          setSlots([]);
          setToast({ message: "Unable to load availability", tone: "error" });
        }
      } finally {
        if (!ignore) {
          setLoadingSlots(false);
        }
      }
    }

    fetchAvailability();

    return () => {
      ignore = true;
    };
  }, [appointment, date, getIdToken]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    if (!appointment) return;
    try {
      await apiFetch(`/api/appointments/${appointment._id}`, {
        method: "PATCH",
        body: JSON.stringify(values),
        getIdToken,
      });
      setToast({ message: "Appointment rescheduled", tone: "success" });
      onSuccess();
    } catch (error) {
      setToast({ message: "Failed to reschedule", tone: "error" });
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Reschedule appointment</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col">
              <label htmlFor="reschedule-date" className="font-medium">
                Date
              </label>
              <input
                id="reschedule-date"
                type="date"
                {...register("date")}
                className="rounded border px-3 py-2"
                aria-invalid={errors.date ? "true" : "false"}
              />
              {errors.date && (
                <span className="text-sm text-red-600">{errors.date.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="reschedule-start" className="font-medium">
                Start time
              </label>
              <input
                id="reschedule-start"
                type="time"
                step={900}
                {...register("startTime")}
                className="rounded border px-3 py-2"
                aria-invalid={errors.startTime ? "true" : "false"}
              />
              {errors.startTime && (
                <span className="text-sm text-red-600">{errors.startTime.message}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="reschedule-end" className="font-medium">
                End time
              </label>
              <input
                id="reschedule-end"
                type="time"
                step={900}
                {...register("endTime")}
                className="rounded border px-3 py-2"
                aria-invalid={errors.endTime ? "true" : "false"}
              />
              {errors.endTime && (
                <span className="text-sm text-red-600">{errors.endTime.message}</span>
              )}
            </div>
            <div className="flex flex-col sm:col-span-2">
              <label htmlFor="reschedule-reason" className="font-medium">
                Reason
              </label>
              <textarea
                id="reschedule-reason"
                rows={3}
                {...register("reason")}
                className="rounded border px-3 py-2"
              />
              {errors.reason && (
                <span className="text-sm text-red-600">{errors.reason.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Available slots</p>
            {loadingSlots ? (
              <p>Loading…</p>
            ) : slots.length === 0 ? (
              <p>No slots for this date.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className="rounded border px-3 py-1 text-sm"
                    onClick={() => setValue("startTime", slot, { shouldValidate: true })}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded border px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>

        {toast && (
          <div
            role="status"
            className={`mt-4 rounded px-3 py-2 text-sm ${
              toast.tone === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
