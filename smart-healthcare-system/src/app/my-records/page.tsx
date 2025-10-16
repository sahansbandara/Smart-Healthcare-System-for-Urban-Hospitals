"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../components/AuthProvider";
import { useRouter } from "next/navigation";

export default function PatientRecordsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    loadMedicalRecord();
  }, [user, router]);

  const loadMedicalRecord = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/medical-records?email=${user.email}`);
      const data = await res.json();

      if (res.ok) {
        setMedicalRecord(data);
      } else {
        if (res.status === 404) {
          setError("No medical records found. Records will appear here after your first doctor consultation.");
        } else {
          setError(data.error || "Failed to load medical records");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load medical records");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground/70">Loading your medical records...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">📋 My Medical Records</h1>
        <p className="text-foreground/70 mt-1">View your personal health history</p>
      </div>

      {error && !medicalRecord && (
        <div className="border rounded-lg p-8 text-center bg-blue-50 dark:bg-blue-900/10">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-foreground/70 text-lg">{error}</p>
          <p className="text-sm text-foreground/60 mt-2">
            Medical records are added by doctors during consultations.
          </p>
        </div>
      )}

      {medicalRecord && (
        <>
          {/* Patient Summary */}
          <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="text-xl font-bold mb-4">👤 Patient Information</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-foreground/60">Name</div>
                <div className="font-medium">{medicalRecord.patientName}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Email</div>
                <div className="font-medium">{medicalRecord.patientEmail}</div>
              </div>
              <div>
                <div className="text-sm text-foreground/60">Total Consultations</div>
                <div className="font-medium text-2xl text-blue-600">
                  {medicalRecord.consultations?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Health Summary */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-red-600">⚠️ Allergies</h3>
              {medicalRecord.allergies && medicalRecord.allergies.length > 0 ? (
                <ul className="space-y-1">
                  {medicalRecord.allergies.map((allergy: string, idx: number) => (
                    <li key={idx} className="text-sm">• {allergy}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-foreground/60">None recorded</p>
              )}
            </div>

            <div className="border rounded-lg p-5">
              <h3 className="font-semibold mb-3 text-orange-600">🩺 Chronic Conditions</h3>
              {medicalRecord.chronicConditions && medicalRecord.chronicConditions.length > 0 ? (
                <ul className="space-y-1">
                  {medicalRecord.chronicConditions.map((condition: string, idx: number) => (
                    <li key={idx} className="text-sm">• {condition}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-foreground/60">None recorded</p>
              )}
            </div>
          </div>

          {/* Consultation History */}
          {medicalRecord.consultations && medicalRecord.consultations.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">📜 Consultation History</h2>
              
              <div className="space-y-4">
                {medicalRecord.consultations.slice().reverse().map((consult: any, idx: number) => (
                  <div key={idx} className="border rounded-lg p-6 bg-white dark:bg-gray-900">
                    {/* Consultation Header */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b">
                      <div>
                        <div className="font-bold text-lg">👨‍⚕️ {consult.doctorName}</div>
                        <div className="text-sm text-foreground/60">
                          📅 {new Date(consult.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })} at {new Date(consult.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                        Consultation #{medicalRecord.consultations.length - idx}
                      </span>
                    </div>

                    {/* Symptoms & Observations */}
                    {consult.symptoms && (
                      <div className="mb-4">
                        <div className="font-semibold text-sm text-foreground/70 mb-1">🤒 Symptoms</div>
                        <p className="text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
                          {consult.symptoms}
                        </p>
                      </div>
                    )}

                    {consult.observations && (
                      <div className="mb-4">
                        <div className="font-semibold text-sm text-foreground/70 mb-1">🔍 Doctor's Observations</div>
                        <p className="text-sm bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md">
                          {consult.observations}
                        </p>
                      </div>
                    )}

                    {/* Vital Signs */}
                    {consult.vitalSigns && Object.values(consult.vitalSigns).some(v => v) && (
                      <div className="mb-4">
                        <div className="font-semibold text-sm text-foreground/70 mb-2">📊 Vital Signs</div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          {consult.vitalSigns.bloodPressure && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                              <div className="text-xs text-foreground/60">Blood Pressure</div>
                              <div className="font-semibold">{consult.vitalSigns.bloodPressure}</div>
                            </div>
                          )}
                          {consult.vitalSigns.temperature && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                              <div className="text-xs text-foreground/60">Temperature</div>
                              <div className="font-semibold">{consult.vitalSigns.temperature}</div>
                            </div>
                          )}
                          {consult.vitalSigns.heartRate && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                              <div className="text-xs text-foreground/60">Heart Rate</div>
                              <div className="font-semibold">{consult.vitalSigns.heartRate}</div>
                            </div>
                          )}
                          {consult.vitalSigns.weight && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                              <div className="text-xs text-foreground/60">Weight</div>
                              <div className="font-semibold">{consult.vitalSigns.weight}</div>
                            </div>
                          )}
                          {consult.vitalSigns.height && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-center">
                              <div className="text-xs text-foreground/60">Height</div>
                              <div className="font-semibold">{consult.vitalSigns.height}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Diagnoses */}
                    {consult.diagnoses && consult.diagnoses.length > 0 && (
                      <div className="mb-4">
                        <div className="font-semibold text-sm text-foreground/70 mb-2">🩺 Diagnosis</div>
                        <div className="space-y-2">
                          {consult.diagnoses.map((d: any, i: number) => (
                            <div key={i} className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{d.condition}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  d.severity === 'Severe' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                  d.severity === 'Moderate' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                  {d.severity}
                                </span>
                              </div>
                              {d.notes && (
                                <div className="text-sm text-foreground/70 mt-1">{d.notes}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {consult.prescriptions && consult.prescriptions.length > 0 && (
                      <div className="mb-4">
                        <div className="font-semibold text-sm text-foreground/70 mb-2">💊 Prescriptions</div>
                        <div className="space-y-2">
                          {consult.prescriptions.map((p: any, i: number) => (
                            <div key={i} className="bg-green-50 dark:bg-green-900/10 p-3 rounded-md">
                              <div className="font-medium">{p.medicineName}</div>
                              <div className="text-sm text-foreground/70 mt-1">
                                📋 {p.dosage} • {p.frequency} • {p.duration}
                              </div>
                              {p.instructions && (
                                <div className="text-sm text-foreground/60 mt-1 italic">
                                  ℹ️ {p.instructions}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Notes */}
                    {consult.notes && (
                      <div className="mb-4">
                        <div className="font-semibold text-sm text-foreground/70 mb-1">📝 Clinical Notes</div>
                        <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-md italic">
                          {consult.notes}
                        </p>
                      </div>
                    )}

                    {/* Follow-up */}
                    {consult.followUpDate && (
                      <div className="pt-4 border-t">
                        <div className="text-sm">
                          <span className="font-semibold text-blue-600">📅 Follow-up Scheduled:</span>{' '}
                          {new Date(consult.followUpDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-foreground/70">No consultation history yet.</p>
              <p className="text-sm text-foreground/60 mt-2">
                Your consultation records will appear here after doctor visits.
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/10">
            <h4 className="font-medium mb-2">ℹ️ About Your Medical Records</h4>
            <ul className="text-sm text-foreground/70 space-y-1">
              <li>✅ Only you can view your personal medical records</li>
              <li>✅ Records are added by doctors during consultations</li>
              <li>✅ All data is securely stored and encrypted</li>
              <li>✅ You can download or print this page for your reference</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
