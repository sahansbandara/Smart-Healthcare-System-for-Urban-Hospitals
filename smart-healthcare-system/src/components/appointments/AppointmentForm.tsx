"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ZAppointmentCreate } from "@/models";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

type DoctorOption = {
  id: string;
  name: string;
  department: string;
};

type AppointmentFormProps = {
  doctors: DoctorOption[];
  onCreated?: () => void;
};

const FormSchema = ZAppointmentCreate.extend({
  department: z.string().min(1, "Department is required"),
});

type FormValues = z.infer<typeof FormSchema>;

type ToastState = {
  message: string;
  tone: "success" | "error";
};

export function AppointmentForm({ doctors, onCreated }: AppointmentFormProps) {
  const { getIdToken } = useAuth();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      department: "",
      doctorId: "",
      date: "",
      startTime: "",
      endTime: "",
      reason: "",
      patientId: "",
    } as FormValues,
  });

  const department = watch("department");
  const doctorId = watch("doctorId");
  const date = watch("date");

  useEffect(() => {
    if (!doctorId) {
      setValue("department", "");
    }
  }, [doctorId, setValue]);

  const filteredDoctors = useMemo(() => {
    if (!department) {
      return doctors;
    }
    return doctors.filter((doctor) => doctor.department === department);
  }, [doctors, department]);

  useEffect(() => {
    let ignore = false;
    async function fetchSlots() {
      if (!doctorId || !date) {
        setAvailableSlots([]);
        return;
      }
      setSlotLoading(true);
      try {
        const tokenProvider = async () => getIdToken();
        const response = await apiFetch<{ slots: string[] }>(
          `/api/doctors/${doctorId}/availability?date=${date}`,
          { getIdToken: tokenProvider }
        );
        if (!ignore) {
          setAvailableSlots(response.data.slots);
        }
      } catch (error) {
        if (!ignore) {
          setAvailableSlots([]);
          setToast({ message: "Unable to load availability", tone: "error" });
        }
      } finally {
        if (!ignore) {
          setSlotLoading(false);
        }
      }
    }
    fetchSlots();
    return () => {
      ignore = true;
    };
  }, [doctorId, date, getIdToken]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      const { department: _department, ...payload } = values;
      const tokenProvider = async () => getIdToken();
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify(payload),
        getIdToken: tokenProvider,
      });
      setToast({ message: "Appointment booked successfully", tone: "success" });
      reset();
      onCreated?.();
    } catch (error) {
      setToast({ message: "Failed to book appointment", tone: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <label htmlFor="patientId" className="font-medium">
            Patient ID
          </label>
          <input
            id="patientId"
            type="text"
            {...register("patientId")}
            className="rounded border px-3 py-2"
            aria-invalid={errors.patientId ? "true" : "false"}
          />
          {errors.patientId && (
            <span className="text-sm text-red-600">{errors.patientId.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="department" className="font-medium">
            Department
          </label>
          <select
            id="department"
            {...register("department")}
            className="rounded border px-3 py-2"
            aria-invalid={errors.department ? "true" : "false"}
          >
            <option value="">Select department</option>
            {[...new Set(doctors.map((doctor) => doctor.department))].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
          {errors.department && (
            <span className="text-sm text-red-600">{errors.department.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="doctorId" className="font-medium">
            Doctor
          </label>
          <select
            id="doctorId"
            {...register("doctorId")}
            className="rounded border px-3 py-2"
            aria-invalid={errors.doctorId ? "true" : "false"}
          >
            <option value="">Select doctor</option>
            {filteredDoctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          {errors.doctorId && (
            <span className="text-sm text-red-600">{errors.doctorId.message}</span>
          )}
        </div>
        <div className="flex flex-col">
          <label htmlFor="date" className="font-medium">
            Date
          </label>
          <input
            id="date"
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
          <label htmlFor="startTime" className="font-medium">
            Start time
          </label>
          <input
            id="startTime"
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
          <label htmlFor="endTime" className="font-medium">
            End time
          </label>
          <input
            id="endTime"
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
      </div>
      <div className="flex flex-col">
        <label htmlFor="reason" className="font-medium">
          Reason
        </label>
        <textarea
          id="reason"
          rows={3}
          {...register("reason")}
          className="rounded border px-3 py-2"
          aria-invalid={errors.reason ? "true" : "false"}
        />
        {errors.reason && (
          <span className="text-sm text-red-600">{errors.reason.message}</span>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-medium">Available slots</p>
        {slotLoading ? (
          <p>Loading availability…</p>
        ) : availableSlots.length === 0 ? (
          <p>No slots available for the selected date.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {availableSlots.map((slot) => (
              <button
                type="button"
                key={slot}
                className="rounded border px-3 py-1 text-sm"
                onClick={() => {
                  setValue("startTime", slot, { shouldValidate: true });
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
      >
        {isSubmitting ? "Booking…" : "Book appointment"}
      </button>

      {toast && (
        <div
          role="status"
          className={`rounded px-3 py-2 text-sm ${
            toast.tone === "success" ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
          }`}
        >
          {toast.message}
        </div>
      )}
    </form>
  );
}
