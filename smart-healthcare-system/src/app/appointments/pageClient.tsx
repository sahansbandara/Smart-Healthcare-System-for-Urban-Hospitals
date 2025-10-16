"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";

type Doctor = { id: string; name: string; specialty: string };

type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail?: string;
  date: string;
  reason: string;
};

export default function AppointmentsClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const preselectDoctor = sp.get("doctorId");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [form, setForm] = useState({
    doctorId: preselectDoctor ?? "",
    patientName: "",
    date: "",
    reason: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/doctors").then(r => r.json()).then(setDoctors);
    fetch("/api/appointments").then(r => r.json()).then(setAppointments);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      router.push("/login");
      return;
    }
    
    setError(null);
    if (!form.doctorId || !form.patientName || !form.date) {
      setError("Please fill doctor, patient name, and date.");
      return;
    }
    const res = await fetch("/api/appointments", { 
      method: "POST", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        patientEmail: user.email,
      }),
    });
    if (!res.ok) {
      setError("Failed to create appointment");
      return;
    }
    const created = await res.json();
    setAppointments((prev) => [created, ...prev]);
    setForm({ doctorId: preselectDoctor ?? "", patientName: "", date: "", reason: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-foreground/70">
          {user ? "Book and review your appointments." : "Please login to book appointments."}
        </p>
      </div>

      {!user && (
        <div className="border rounded-lg p-6 text-center space-y-3">
          <p className="text-foreground/70">You need to be logged in to book appointments.</p>
          <button
            onClick={() => router.push("/login")}
            className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90"
          >
            Login to Continue
          </button>
        </div>
      )}

      {user && (
        <form onSubmit={submit} className="border rounded-lg p-4 grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="doctor" className="block text-sm mb-1">Doctor</label>
            <select
              id="doctor"
              title="Select doctor"
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={form.doctorId}
              onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
            >
              <option value="">Select a doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="patientName" className="block text-sm mb-1">Patient name</label>
            <input
              id="patientName"
              title="Patient name"
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="e.g., John Doe"
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm mb-1">Date & time</label>
            <input
              type="datetime-local"
              id="date"
              title="Appointment date and time"
              className="w-full border rounded-md px-3 py-2 bg-background"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm mb-1">Reason (optional)</label>
            <input
              id="reason"
              title="Reason for appointment"
              className="w-full border rounded-md px-3 py-2 bg-background"
              placeholder="Checkup, consultation, etc."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium">
              Book appointment
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      )}

      <div className="space-y-2">
        <h2 className="font-semibold">All upcoming appointments</h2>
        <ul className="space-y-2">
          {appointments.length === 0 && (
            <li className="text-sm text-foreground/70">No appointments yet.</li>
          )}
          {appointments.map((a) => {
            const d = doctors.find((x) => x.id === a.doctorId);
            return (
              <li key={a.id} className="border rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-medium">{d?.name ?? "Doctor"}</div>
                  <div className="text-foreground/70">{new Date(a.date).toLocaleString()}</div>
                  <div className="text-foreground/70">{a.patientName}{a.reason ? ` — ${a.reason}` : ""}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
