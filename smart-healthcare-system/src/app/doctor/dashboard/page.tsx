"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";

type DoctorProfile = {
  id: string;
  name: string;
  email: string;
  specialty: string;
};

type Appointment = {
  id: string;
  doctorId: string;
  patientName: string;
  patientEmail: string;
  date: string;
  reason: string;
};

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("upcoming");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/doctor/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.email) {
      loadDoctorData();
    }
  }, [user]);

  const loadDoctorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get doctor profile
      const profileRes = await fetch(`/api/doctors/profile?email=${user?.email}`);
      if (!profileRes.ok) {
        throw new Error("Doctor profile not found. Please contact administration.");
      }
      const profile = await profileRes.json();
      setDoctorProfile(profile);

      // Get appointments for this doctor
      const appointmentsRes = await fetch(`/api/appointments?doctorId=${profile.id}`);
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        setAppointments(appointmentsData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load doctor data");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (filter) {
      case "today":
        return appointments.filter(a => {
          const apptDate = new Date(a.date);
          return apptDate >= today && apptDate < tomorrow;
        });
      case "upcoming":
        return appointments.filter(a => new Date(a.date) >= now);
      case "all":
      default:
        return appointments;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
        <button
          onClick={() => router.push("/doctor/login")}
          className="px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90"
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (!user || !doctorProfile) {
    return null;
  }

  const filteredAppointments = getFilteredAppointments();
  const todayCount = appointments.filter(a => {
    const apptDate = new Date(a.date);
    const today = new Date();
    return apptDate.toDateString() === today.toDateString();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">👨‍⚕️ Doctor Portal</h1>
            <p className="text-xl mt-2">{doctorProfile.name}</p>
            <p className="text-foreground/70 mt-1">{doctorProfile.specialty}</p>
            <p className="text-sm text-foreground/60 mt-1">{doctorProfile.email}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{todayCount}</div>
            <div className="text-sm text-foreground/70">Today's Appointments</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <button
          onClick={() => router.push('/doctor/records')}
          className="border rounded-lg p-6 text-left hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-500 transition-all group"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-600">Patient Records</h3>
          <p className="text-sm text-foreground/70">Search and manage patient medical records</p>
        </button>
        <div className="border rounded-lg p-6 bg-gray-50 dark:bg-gray-900/20">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="text-lg font-semibold mb-1">Appointments</h3>
          <p className="text-sm text-foreground/70">View your scheduled appointments below</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">{appointments.length}</div>
          <div className="text-sm text-foreground/70">Total Appointments</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">
            {appointments.filter(a => new Date(a.date) >= new Date()).length}
          </div>
          <div className="text-sm text-foreground/70">Upcoming</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold">
            {new Set(appointments.map(a => a.patientEmail)).size}
          </div>
          <div className="text-sm text-foreground/70">Unique Patients</div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">📋 Appointment Schedule</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("today")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "today"
                  ? "bg-foreground text-background"
                  : "border hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              📅 Today
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "upcoming"
                  ? "bg-foreground text-background"
                  : "border hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              🔜 Upcoming
            </button>
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                filter === "all"
                  ? "bg-foreground text-background"
                  : "border hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              📚 All
            </button>
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="border rounded-lg p-8 text-center">
            <p className="text-foreground/70">No appointments found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((appt) => {
                const apptDate = new Date(appt.date);
                const isPast = apptDate < new Date();
                const isToday = apptDate.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={appt.id}
                    className={`border rounded-lg p-4 ${
                      isPast ? "opacity-60" : ""
                    } ${isToday ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold">{appt.patientName}</div>
                          {isToday && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              Today
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-foreground/70">{appt.patientEmail}</div>
                        <div className="text-sm">
                          📅 {apptDate.toLocaleDateString()} at {apptDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {appt.reason && (
                          <div className="text-sm text-foreground/70">
                            <span className="font-medium">Reason:</span> {appt.reason}
                          </div>
                        )}
                      </div>
                      <div>
                        {isPast ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            Completed
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            Scheduled
                          </span>
                        )}
                      </div>
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
