"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { RescheduleDialog } from "./RescheduleDialog";

type Appointment = {
  _id: string;
  doctorId: string;
  doctorName?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "BOOKED" | "RESCHEDULED" | "CANCELLED" | "COMPLETED";
  reason: string;
};

type ApiListResponse = {
  items: Appointment[];
  page: number;
  total: number;
};

type Filters = {
  status: "" | Appointment["status"];
  doctorId: string;
  from: string;
  to: string;
};

type ToastState = {
  message: string;
  tone: "success" | "error";
};

const STATUS_OPTIONS: Appointment["status"][] = [
  "BOOKED",
  "RESCHEDULED",
  "CANCELLED",
  "COMPLETED",
];

export function AppointmentTable() {
  const { getIdToken } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [filters, setFilters] = useState<Filters>({ status: "", doctorId: "", from: "", to: "" });
  const [selected, setSelected] = useState<Appointment | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (filters.status) params.set("status", filters.status);
      if (filters.doctorId) params.set("doctorId", filters.doctorId);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const response = await apiFetch<ApiListResponse>(`/api/appointments?${params.toString()}`, {
        getIdToken,
      });
      setAppointments(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      setToast({ message: "Failed to load appointments", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit, getIdToken]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const onCancel = async (appointment: Appointment) => {
    const previous = [...appointments];
    setAppointments((items) =>
      items.map((item) =>
        item._id === appointment._id ? { ...item, status: "CANCELLED" } : item
      )
    );
    try {
      await apiFetch(`/api/appointments/${appointment._id}`, {
        method: "DELETE",
        getIdToken,
      });
      setToast({ message: "Appointment cancelled", tone: "success" });
      loadAppointments();
    } catch (error) {
      setAppointments(previous);
      setToast({ message: "Unable to cancel appointment", tone: "error" });
    }
  };

  const onRescheduled = () => {
    setSelected(null);
    loadAppointments();
    setToast({ message: "Appointment updated", tone: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label htmlFor="status-filter" className="text-sm font-medium">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(event) => {
              setPage(1);
              setFilters((state) => ({ ...state, status: event.target.value as Filters["status"] }));
            }}
            className="rounded border px-3 py-2"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="doctor-filter" className="text-sm font-medium">
            Doctor ID
          </label>
          <input
            id="doctor-filter"
            type="search"
            value={filters.doctorId}
            onChange={(event) => {
              setPage(1);
              setFilters((state) => ({ ...state, doctorId: event.target.value }));
            }}
            className="rounded border px-3 py-2"
            placeholder="Doctor ObjectId"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="from-date" className="text-sm font-medium">
            From
          </label>
          <input
            id="from-date"
            type="date"
            value={filters.from}
            onChange={(event) => {
              setPage(1);
              setFilters((state) => ({ ...state, from: event.target.value }));
            }}
            className="rounded border px-3 py-2"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="to-date" className="text-sm font-medium">
            To
          </label>
          <input
            id="to-date"
            type="date"
            value={filters.to}
            onChange={(event) => {
              setPage(1);
              setFilters((state) => ({ ...state, to: event.target.value }));
            }}
            className="rounded border px-3 py-2"
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => {
              setPage(1);
              loadAppointments();
            }}
            className="rounded bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            Apply
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Doctor
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Date
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Time
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  Loading appointments…
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center">
                  No appointments found.
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td className="px-3 py-3 text-sm text-gray-900">{appointment.doctorName ?? appointment.doctorId}</td>
                  <td className="px-3 py-3 text-sm text-gray-900">{appointment.date}</td>
                  <td className="px-3 py-3 text-sm text-gray-900">
                    {appointment.startTime} - {appointment.endTime}
                  </td>
                  <td className="px-3 py-3 text-sm font-medium">
                    <span className="rounded bg-gray-100 px-2 py-1 text-xs uppercase">{appointment.status}</span>
                  </td>
                  <td className="px-3 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded border px-3 py-1"
                        onClick={() => alert(appointment.reason)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="rounded border px-3 py-1"
                        onClick={() => setSelected(appointment)}
                        disabled={appointment.status === "CANCELLED"}
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        className="rounded border border-red-600 px-3 py-1 text-red-600"
                        onClick={() => onCancel(appointment)}
                        disabled={appointment.status === "CANCELLED"}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPage((value) => Math.max(1, value - 1));
            }}
            className="rounded border px-3 py-1"
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              setPage((value) => Math.min(totalPages, value + 1));
            }}
            className="rounded border px-3 py-1"
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </div>

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

      <RescheduleDialog
        appointment={selected}
        onClose={() => setSelected(null)}
        onSuccess={onRescheduled}
      />
    </div>
  );
}
