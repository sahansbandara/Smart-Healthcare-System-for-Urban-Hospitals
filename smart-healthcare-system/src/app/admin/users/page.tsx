"use client";
import { useState, useEffect } from "react";

type Patient = {
  email: string;
  name: string;
  createdAt: string;
};

type Doctor = {
  id: string;
  email: string;
  name: string;
  specialty: string;
  createdAt: string;
};

export default function UsersPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"patients" | "doctors">("patients");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Fetch doctors
      const doctorsRes = await fetch("/api/doctors");
      if (doctorsRes.ok) {
        const doctorsData = await doctorsRes.json();
        setDoctors(doctorsData);
      }

      // For patients, we'll fetch from appointments to get unique patients
      const appointmentsRes = await fetch("/api/appointments");
      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json();
        const uniquePatients = Array.from(
          new Map(
            appointmentsData.map((apt: any) => [
              apt.patientEmail,
              {
                email: apt.patientEmail,
                name: apt.patientName,
                createdAt: apt.createdAt || new Date().toISOString(),
              },
            ])
          ).values()
        );
        setPatients(uniquePatients as Patient[]);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">👥 User Management</h1>
        <p className="text-foreground/70">View all registered users in the system</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("patients")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "patients"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-foreground/70 hover:text-foreground"
          }`}
        >
          Patients ({patients.length})
        </button>
        <button
          onClick={() => setActiveTab("doctors")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "doctors"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-foreground/70 hover:text-foreground"
          }`}
        >
          Doctors ({doctors.length})
        </button>
      </div>

      {/* Patients List */}
      {activeTab === "patients" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Registered Patients</h2>
            <button
              onClick={loadUsers}
              className="px-3 py-1.5 text-sm rounded-md border hover:bg-black/5 dark:hover:bg-white/10"
            >
              🔄 Refresh
            </button>
          </div>

          {patients.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-foreground/70">No patients registered yet.</p>
              <p className="text-sm text-foreground/50 mt-2">
                Patients will appear here after they book appointments.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map((patient, idx) => (
                    <tr key={patient.email} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{patient.name}</td>
                      <td className="px-4 py-3 text-sm text-foreground/70">{patient.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Doctors List */}
      {activeTab === "doctors" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Registered Doctors</h2>
            <button
              onClick={loadUsers}
              className="px-3 py-1.5 text-sm rounded-md border hover:bg-black/5 dark:hover:bg-white/10"
            >
              🔄 Refresh
            </button>
          </div>

          {doctors.length === 0 ? (
            <div className="border rounded-lg p-8 text-center">
              <p className="text-foreground/70">No doctors registered yet.</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">#</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Specialty</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {doctors.map((doctor, idx) => (
                    <tr key={doctor.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="px-4 py-3 text-sm">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium">{doctor.name}</td>
                      <td className="px-4 py-3 text-sm text-foreground/70">{doctor.email}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                          {doctor.specialty}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <h3 className="font-semibold mb-3">📊 System Statistics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold">{patients.length + doctors.length}</div>
            <div className="text-sm text-foreground/70">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{patients.length}</div>
            <div className="text-sm text-foreground/70">Patients</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{doctors.length}</div>
            <div className="text-sm text-foreground/70">Doctors</div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
        <h4 className="font-medium mb-2">ℹ️ Multi-User System Active</h4>
        <ul className="text-sm text-foreground/70 space-y-1">
          <li>✅ Multiple users can login simultaneously</li>
          <li>✅ Each user has independent sessions</li>
          <li>✅ Firebase Authentication + MongoDB storage</li>
          <li>✅ Role-based access control (Patient/Doctor)</li>
          <li>✅ Secure password hashing</li>
        </ul>
      </div>
    </div>
  );
}
