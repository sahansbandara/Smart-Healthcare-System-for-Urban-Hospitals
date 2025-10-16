"use client";
import { useState } from "react";

export default function SeedDoctorsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSeed = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/doctors/seed", {
        method: "POST",
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to seed doctors");
      }
    } catch (err: any) {
      setError(err.message || "Failed to seed doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to delete ALL doctors from the database?")) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/doctors/seed", {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to reset doctors");
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset doctors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🔧 Admin: Seed Doctors</h1>
        <p className="text-foreground/70 mt-2">Add more doctors to the database</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md">
          <p className="font-medium">{result.message}</p>
          {result.totalDoctors && (
            <p className="text-sm mt-1">Total doctors in database: {result.totalDoctors}</p>
          )}
          {result.added && result.added.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Added doctors:</p>
              <ul className="text-sm mt-1 space-y-1">
                {result.added.map((doc: any, idx: number) => (
                  <li key={idx}>• {doc.name} - {doc.specialty}</li>
                ))}
              </ul>
            </div>
          )}
          {result.note && (
            <p className="text-sm mt-2 italic">{result.note}</p>
          )}
        </div>
      )}

      <div className="border rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Add More Doctors</h2>
          <p className="text-sm text-foreground/70 mb-4">
            This will add 14 additional doctors to the database (if they don't already exist).
            Includes specialists in:
          </p>
          <ul className="text-sm text-foreground/70 grid grid-cols-2 gap-2 mb-4">
            <li>• Cardiology (1)</li>
            <li>• Pediatrics (1)</li>
            <li>• Dermatology (1)</li>
            <li>• Neurology (2)</li>
            <li>• Orthopedic Surgery (2)</li>
            <li>• General Practice (3)</li>
            <li>• Ophthalmology (2)</li>
            <li>• Psychiatry (2)</li>
          </ul>
          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding doctors..." : "➕ Add Doctors to Database"}
          </button>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-xl font-semibold mb-2 text-red-600 dark:text-red-400">
            ⚠️ Danger Zone
          </h2>
          <p className="text-sm text-foreground/70 mb-4">
            Reset the database by deleting all doctors. This action cannot be undone!
          </p>
          <button
            onClick={handleReset}
            disabled={loading}
            className="w-full px-5 py-2.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Resetting..." : "🗑️ Delete All Doctors"}
          </button>
          <p className="text-xs text-foreground/60 mt-2 italic">
            After reset, visit /api/doctors to auto-seed with initial 17 doctors
          </p>
        </div>
      </div>

      <div className="text-center">
        <a
          href="/doctors"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          ← Back to Doctors List
        </a>
      </div>
    </div>
  );
}
