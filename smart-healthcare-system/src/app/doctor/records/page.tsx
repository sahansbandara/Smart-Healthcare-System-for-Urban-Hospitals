"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../../components/AuthProvider";
import { useRouter } from "next/navigation";

type PatientOption = {
  email: string;
  name: string;
};

export default function DoctorRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<any>(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [patient, setPatient] = useState<any>(null);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddConsultation, setShowAddConsultation] = useState(false);
  const [patientsList, setPatientsList] = useState<PatientOption[]>([]);
  const [searchMode, setSearchMode] = useState<"select" | "email">("select");

  // Consultation form state
  const [consultation, setConsultation] = useState({
    symptoms: "",
    observations: "",
    vitalSigns: {
      bloodPressure: "",
      temperature: "",
      heartRate: "",
      weight: "",
      height: "",
    },
    diagnoses: [{ condition: "", severity: "Mild", notes: "" }],
    prescriptions: [{ medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    notes: "",
    followUpDate: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/doctor/login");
      return;
    }

    // Fetch doctor profile
    const fetchDoctor = async () => {
      try {
        const res = await fetch(`/api/doctors/profile?email=${user.email}`);
        if (res.ok) {
          const data = await res.json();
          setDoctor(data);
        }
      } catch (err) {
        console.error("Failed to fetch doctor profile");
      }
    };

    // Fetch patients list
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/appointments");
        if (res.ok) {
          const appointments = await res.json();
          // Extract unique patients from appointments
          const uniquePatients = Array.from(
            new Map(
              appointments.map((apt: any) => [
                apt.patientEmail,
                { email: apt.patientEmail, name: apt.patientName },
              ])
            ).values()
          ) as PatientOption[];
          setPatientsList(uniquePatients);
        }
      } catch (err) {
        console.error("Failed to fetch patients");
      }
    };

    fetchDoctor();
    fetchPatients();
  }, [user, router]);

  const searchPatient = async () => {
    if (!searchEmail) {
      setError("Please enter patient email");
      return;
    }

    setLoading(true);
    setError("");
    setPatient(null);
    setMedicalRecord(null);

    try {
      // Fetch medical record
      const res = await fetch(`/api/medical-records?email=${searchEmail}`);
      const data = await res.json();

      if (res.ok) {
        setMedicalRecord(data);
        setPatient({
          email: data.patientEmail,
          name: data.patientName,
          id: data.patientId,
        });
      } else {
        // Patient doesn't have a record yet - create a new patient entry
        const selectedPatient = patientsList.find(p => p.email === searchEmail);
        if (selectedPatient) {
          setPatient({
            email: selectedPatient.email,
            name: selectedPatient.name,
            id: searchEmail, // Use email as temporary ID
          });
          setMedicalRecord({
            patientEmail: selectedPatient.email,
            patientName: selectedPatient.name,
            allergies: [],
            chronicConditions: [],
            consultations: [],
          });
          setError(""); // Clear error - this is a new patient
        } else {
          setError("Patient not found in system");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to search patient");
    } finally {
      setLoading(false);
    }
  };

  const addDiagnosis = () => {
    setConsultation({
      ...consultation,
      diagnoses: [...consultation.diagnoses, { condition: "", severity: "Mild", notes: "" }],
    });
  };

  const addPrescription = () => {
    setConsultation({
      ...consultation,
      prescriptions: [...consultation.prescriptions, { medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    });
  };

  const saveConsultation = async () => {
    if (!consultation.symptoms && !consultation.observations) {
      setError("Please add symptoms or observations");
      return;
    }

    // Validate at least one diagnosis
    const validDiagnoses = consultation.diagnoses.filter(d => d.condition.trim());
    if (validDiagnoses.length === 0) {
      setError("Please add at least one diagnosis");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientEmail: patient.email,
          doctorId: doctor.id,
          doctorName: doctor.name,
          consultation: {
            ...consultation,
            diagnoses: validDiagnoses,
            prescriptions: consultation.prescriptions.filter(p => p.medicineName.trim()),
          },
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Consultation saved successfully!");
        setShowAddConsultation(false);
        // Refresh medical record
        searchPatient();
        // Reset form
        setConsultation({
          symptoms: "",
          observations: "",
          vitalSigns: { bloodPressure: "", temperature: "", heartRate: "", weight: "", height: "" },
          diagnoses: [{ condition: "", severity: "Mild", notes: "" }],
          prescriptions: [{ medicineName: "", dosage: "", frequency: "", duration: "", instructions: "" }],
          notes: "",
          followUpDate: "",
        });
      } else {
        setError(data.error || "Failed to save consultation");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save consultation");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !doctor) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📋 Patient Records Management</h1>
          <p className="text-foreground/70 mt-1">Search, view, and manage patient medical records</p>
        </div>
        {patient && (
          <button
            onClick={() => setShowAddConsultation(!showAddConsultation)}
            className="px-6 py-3 rounded-md bg-green-600 text-white font-bold text-lg hover:bg-green-700 shadow-lg flex items-center gap-2"
          >
            {showAddConsultation ? (
              <>❌ Cancel</>
            ) : (
              <>➕ Add New Record</>
            )}
          </button>
        )}
      </div>

      {/* Search Patient */}
      <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-900/10">
        <h2 className="text-lg font-semibold mb-4">🔍 Find Patient</h2>
        
        {/* Toggle Search Mode */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSearchMode("select")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              searchMode === "select"
                ? "bg-blue-600 text-white"
                : "border hover:bg-blue-100 dark:hover:bg-blue-900/20"
            }`}
          >
            📋 Select from List
          </button>
          <button
            onClick={() => setSearchMode("email")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              searchMode === "email"
                ? "bg-blue-600 text-white"
                : "border hover:bg-blue-100 dark:hover:bg-blue-900/20"
            }`}
          >
            ✉️ Search by Email
          </button>
        </div>

        {searchMode === "select" ? (
          /* Select Patient from Dropdown */
          <div className="flex gap-3">
            <select
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 border rounded-md px-4 py-2 bg-background"
              aria-label="Select patient"
            >
              <option value="">-- Select a patient --</option>
              {patientsList.map((p) => (
                <option key={p.email} value={p.email}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
            <button
              onClick={searchPatient}
              disabled={loading || !searchEmail}
              className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load Records"}
            </button>
          </div>
        ) : (
          /* Search by Email Input */
          <div className="flex gap-3">
            <input
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="patient@example.com"
              className="flex-1 border rounded-md px-4 py-2 bg-background"
              onKeyDown={(e) => e.key === "Enter" && searchPatient()}
            />
            <button
              onClick={searchPatient}
              disabled={loading}
              className="px-6 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        )}
        
        {patientsList.length > 0 && searchMode === "select" && (
          <p className="text-sm text-foreground/60 mt-2">
            {patientsList.length} patient{patientsList.length !== 1 ? "s" : ""} available
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Patient Info */}
      {patient && (
        <div className="border rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-foreground/70">{patient.email}</p>
          </div>

          {/* Patient Summary */}
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div>
              <div className="text-sm text-foreground/60">Allergies</div>
              <div className="font-medium">
                {medicalRecord?.allergies?.length > 0 
                  ? medicalRecord.allergies.join(", ") 
                  : <span className="text-foreground/50">None recorded</span>}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground/60">Chronic Conditions</div>
              <div className="font-medium">
                {medicalRecord?.chronicConditions?.length > 0 
                  ? medicalRecord.chronicConditions.join(", ") 
                  : <span className="text-foreground/50">None recorded</span>}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground/60">Total Consultations</div>
              <div className="font-medium">{medicalRecord?.consultations?.length || 0}</div>
            </div>
          </div>
          
          {(!medicalRecord?.consultations || medicalRecord.consultations.length === 0) && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ℹ️ This is a new patient with no medical records yet. Click <strong>"➕ Add New Record"</strong> above to create their first consultation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Consultation Form */}
      {showAddConsultation && patient && (
        <div className="border rounded-lg p-6 bg-green-50 dark:bg-green-900/10">
          <h3 className="text-xl font-bold mb-4">➕ New Consultation</h3>
          
          {/* Symptoms & Observations */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Symptoms *</label>
              <textarea
                value={consultation.symptoms}
                onChange={(e) => setConsultation({ ...consultation, symptoms: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background h-24"
                placeholder="Patient complaints and symptoms..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Observations</label>
              <textarea
                value={consultation.observations}
                onChange={(e) => setConsultation({ ...consultation, observations: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background h-24"
                placeholder="Clinical observations..."
              />
            </div>
          </div>

          {/* Vital Signs */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Vital Signs</h4>
            <div className="grid md:grid-cols-5 gap-3">
              <input
                type="text"
                placeholder="BP (120/80)"
                value={consultation.vitalSigns.bloodPressure}
                onChange={(e) => setConsultation({ 
                  ...consultation, 
                  vitalSigns: { ...consultation.vitalSigns, bloodPressure: e.target.value }
                })}
                className="border rounded-md px-3 py-2 bg-background text-sm"
              />
              <input
                type="text"
                placeholder="Temp (°F)"
                value={consultation.vitalSigns.temperature}
                onChange={(e) => setConsultation({ 
                  ...consultation, 
                  vitalSigns: { ...consultation.vitalSigns, temperature: e.target.value }
                })}
                className="border rounded-md px-3 py-2 bg-background text-sm"
              />
              <input
                type="text"
                placeholder="HR (bpm)"
                value={consultation.vitalSigns.heartRate}
                onChange={(e) => setConsultation({ 
                  ...consultation, 
                  vitalSigns: { ...consultation.vitalSigns, heartRate: e.target.value }
                })}
                className="border rounded-md px-3 py-2 bg-background text-sm"
              />
              <input
                type="text"
                placeholder="Weight (kg)"
                value={consultation.vitalSigns.weight}
                onChange={(e) => setConsultation({ 
                  ...consultation, 
                  vitalSigns: { ...consultation.vitalSigns, weight: e.target.value }
                })}
                className="border rounded-md px-3 py-2 bg-background text-sm"
              />
              <input
                type="text"
                placeholder="Height (cm)"
                value={consultation.vitalSigns.height}
                onChange={(e) => setConsultation({ 
                  ...consultation, 
                  vitalSigns: { ...consultation.vitalSigns, height: e.target.value }
                })}
                className="border rounded-md px-3 py-2 bg-background text-sm"
              />
            </div>
          </div>

          {/* Diagnoses */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Diagnoses *</h4>
              <button
                onClick={addDiagnosis}
                className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                + Add Diagnosis
              </button>
            </div>
            {consultation.diagnoses.map((diag, idx) => (
              <div key={idx} className="grid md:grid-cols-3 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Condition/Disease"
                  value={diag.condition}
                  onChange={(e) => {
                    const updated = [...consultation.diagnoses];
                    updated[idx].condition = e.target.value;
                    setConsultation({ ...consultation, diagnoses: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background"
                />
                <select
                  value={diag.severity}
                  onChange={(e) => {
                    const updated = [...consultation.diagnoses];
                    updated[idx].severity = e.target.value;
                    setConsultation({ ...consultation, diagnoses: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background"
                  aria-label="Severity level"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
                <input
                  type="text"
                  placeholder="Notes"
                  value={diag.notes}
                  onChange={(e) => {
                    const updated = [...consultation.diagnoses];
                    updated[idx].notes = e.target.value;
                    setConsultation({ ...consultation, diagnoses: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background"
                />
              </div>
            ))}
          </div>

          {/* Prescriptions */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">Prescriptions</h4>
              <button
                onClick={addPrescription}
                className="text-sm px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                + Add Medicine
              </button>
            </div>
            {consultation.prescriptions.map((rx, idx) => (
              <div key={idx} className="grid md:grid-cols-5 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={rx.medicineName}
                  onChange={(e) => {
                    const updated = [...consultation.prescriptions];
                    updated[idx].medicineName = e.target.value;
                    setConsultation({ ...consultation, prescriptions: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background text-sm"
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={rx.dosage}
                  onChange={(e) => {
                    const updated = [...consultation.prescriptions];
                    updated[idx].dosage = e.target.value;
                    setConsultation({ ...consultation, prescriptions: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background text-sm"
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={rx.frequency}
                  onChange={(e) => {
                    const updated = [...consultation.prescriptions];
                    updated[idx].frequency = e.target.value;
                    setConsultation({ ...consultation, prescriptions: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background text-sm"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={rx.duration}
                  onChange={(e) => {
                    const updated = [...consultation.prescriptions];
                    updated[idx].duration = e.target.value;
                    setConsultation({ ...consultation, prescriptions: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background text-sm"
                />
                <input
                  type="text"
                  placeholder="Instructions"
                  value={rx.instructions}
                  onChange={(e) => {
                    const updated = [...consultation.prescriptions];
                    updated[idx].instructions = e.target.value;
                    setConsultation({ ...consultation, prescriptions: updated });
                  }}
                  className="border rounded-md px-3 py-2 bg-background text-sm"
                  aria-label="Medicine instructions"
                />
              </div>
            ))}
          </div>

          {/* Notes & Follow-up */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <textarea
                value={consultation.notes}
                onChange={(e) => setConsultation({ ...consultation, notes: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background h-24"
                placeholder="Any additional notes..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Follow-up Date</label>
              <input
                type="date"
                value={consultation.followUpDate}
                onChange={(e) => setConsultation({ ...consultation, followUpDate: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
              />
            </div>
          </div>

          <button
            onClick={saveConsultation}
            disabled={loading}
            className="w-full px-6 py-3 rounded-md bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "💾 Save Consultation"}
          </button>
        </div>
      )}

      {/* Consultation History */}
      {medicalRecord && medicalRecord.consultations && medicalRecord.consultations.length > 0 && (
        <div className="border rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📜 Consultation History</h3>
          <div className="space-y-4">
            {medicalRecord.consultations.slice().reverse().map((consult: any, idx: number) => (
              <div key={idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold">{consult.doctorName}</div>
                    <div className="text-sm text-foreground/60">
                      {new Date(consult.date).toLocaleDateString()} at {new Date(consult.date).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {consult.symptoms && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Symptoms: </span>
                    <span className="text-sm">{consult.symptoms}</span>
                  </div>
                )}
                
                {consult.diagnoses && consult.diagnoses.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Diagnoses: </span>
                    <div className="text-sm mt-1">
                      {consult.diagnoses.map((d: any, i: number) => (
                        <div key={i} className="ml-4">
                          • {d.condition} <span className="text-foreground/60">({d.severity})</span>
                          {d.notes && <span className="text-foreground/60"> - {d.notes}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {consult.prescriptions && consult.prescriptions.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium">Prescriptions: </span>
                    <div className="text-sm mt-1">
                      {consult.prescriptions.map((p: any, i: number) => (
                        <div key={i} className="ml-4">
                          • {p.medicineName} - {p.dosage}, {p.frequency}, {p.duration}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {consult.notes && (
                  <div className="text-sm text-foreground/70 mt-2 italic">
                    Notes: {consult.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
