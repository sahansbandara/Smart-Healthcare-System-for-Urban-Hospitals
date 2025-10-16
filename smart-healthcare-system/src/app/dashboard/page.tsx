"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";

type Doctor = { id: string; name: string; specialty: string };

type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  date: string;
  reason: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    doctorId: "",
    patientName: "",
    date: "",
    reason: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [doctorsRes, appointmentsRes] = await Promise.all([
        fetch("/api/doctors"),
        fetch(`/api/appointments?email=${user?.email}`),
      ]);
      
      const doctorsData = await doctorsRes.json();
      const appointmentsData = await appointmentsRes.json();
      
      setDoctors(doctorsData);
      setAppointments(appointmentsData.filter((a: Appointment) => a.patientEmail === user?.email));
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!form.doctorId || !form.patientName || !form.date) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          patientEmail: user?.email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create appointment");
      }

      const created = await res.json();
      setAppointments((prev) => [created, ...prev]);
      setForm({ doctorId: "", patientName: "", date: "", reason: "" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || "Failed to create appointment");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">👤 Patient Dashboard</h1>
          <p className="text-foreground/70 mt-1">Welcome back, {user.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/my-records')}
            className="px-5 py-2.5 rounded-md border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
          >
            📋 My Medical Records
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90"
          >
            {showForm ? "✕ Cancel" : "📅 Book New Appointment"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border rounded-lg p-6 space-y-4 bg-blue-50 dark:bg-blue-900/10">
          <h2 className="font-semibold text-lg">📅 Schedule New Appointment</h2>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="doctorId" className="block text-sm font-medium mb-2">
                Doctor *
              </label>
              <select
                id="doctorId"
                required
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
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
              <label htmlFor="patientName" className="block text-sm font-medium mb-2">
                Your Name *
              </label>
              <input
                id="patientName"
                type="text"
                required
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="Full Name"
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date & Time *
              </label>
              <input
                id="date"
                type="datetime-local"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium mb-2">
                Reason (optional)
              </label>
              <input
                id="reason"
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="Checkup, consultation, etc."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">📋 Your Appointments</h2>

        {appointments.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-foreground/70 text-lg">📅 No appointments scheduled</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-foreground hover:underline font-medium"
            >
              Book your first appointment →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => {
              const doctor = doctors.find((d) => d.id === appt.doctorId);
              return (
                <div key={appt.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="font-semibold">{doctor?.name || "Doctor"}</div>
                      <div className="text-sm text-foreground/70">{doctor?.specialty}</div>
                      <div className="text-sm">
                        📅 {new Date(appt.date).toLocaleString()}
                      </div>
                      {appt.reason && (
                        <div className="text-sm text-foreground/70">
                          Reason: {appt.reason}
                        </div>
                      )}
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                      Confirmed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
