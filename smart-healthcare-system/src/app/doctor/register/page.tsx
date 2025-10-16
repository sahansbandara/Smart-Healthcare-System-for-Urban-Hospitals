"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/AuthProvider";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialty: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // For Google sign-in users, only validate specialty
    if (googleSignedIn) {
      if (!formData.specialty) {
        setError("Please select your specialty");
        return;
      }

      setLoading(true);
      try {
        console.log('Creating doctor profile in MongoDB...');
        console.log('Data:', { name: formData.name, email: formData.email, specialty: formData.specialty });
        
        // Create doctor profile in MongoDB
        const res = await fetch("/api/doctors/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            specialty: formData.specialty,
          }),
        });

        const data = await res.json();
        console.log('API Response:', res.status, data);

        if (!res.ok) {
          throw new Error(data.error || data.details || "Failed to create doctor profile");
        }

        console.log('Doctor profile created successfully:', data);
        router.push("/doctor/dashboard");
      } catch (err: any) {
        console.error('Registration error:', err);
        setError(err.message || "Failed to complete registration.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // Regular email/password registration validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!formData.name || !formData.specialty) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      console.log('Step 1: Creating Firebase account...');
      // Create Firebase account
      const userCredential = await signUp(formData.email, formData.password);
      console.log('Firebase account created:', userCredential.user?.uid);
      
      console.log('Step 2: Creating doctor profile in MongoDB...');
      // Create doctor profile in MongoDB
      const res = await fetch("/api/doctors/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          specialty: formData.specialty,
          userId: userCredential.user?.uid,
        }),
      });

      const data = await res.json();
      console.log('MongoDB response:', res.status, data);

      if (!res.ok) {
        throw new Error(data.error || data.details || "Failed to create doctor profile");
      }

      console.log('Registration successful! Redirecting...');
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      const userEmail = result.user?.email;
      const userName = result.user?.displayName || "";

      if (!userEmail) {
        setError("Failed to get email from Google account.");
        setLoading(false);
        return;
      }

      // Check if doctor profile already exists
      const checkRes = await fetch(`/api/doctors/profile?email=${userEmail}`);
      if (checkRes.ok) {
        // Profile exists, redirect to dashboard
        router.push("/doctor/dashboard");
        return;
      }

      // Need to collect specialty
      setGoogleSignedIn(true);
      setFormData(prev => ({ 
        ...prev, 
        email: userEmail, 
        name: userName,
        password: "", // Clear password fields for Google users
        confirmPassword: ""
      }));
      setError("");
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to register with Google.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">👨‍⚕️ Doctor Registration</h1>
        <p className="text-foreground/70 mt-2">Create your medical professional account</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {googleSignedIn && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-md text-sm">
          ✓ Signed in with Google as <strong>{formData.email}</strong>
        </div>
      )}

      <form onSubmit={handleRegister} className="border rounded-lg p-6 space-y-4">
        {!googleSignedIn && (
          <>
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name *
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="Dr. John Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="doctor@hospital.com"
              />
            </div>
          </>
        )}

        <div>
          <label htmlFor="specialty" className="block text-sm font-medium mb-2">
            Specialty *
          </label>
          <select
            id="specialty"
            required
            value={formData.specialty}
            onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
            className="w-full border rounded-md px-3 py-2 bg-background"
          >
            <option value="">Select specialty</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
            <option value="General Practitioner">General Practitioner</option>
            <option value="Ophthalmologist">Ophthalmologist</option>
            <option value="Psychiatrist">Psychiatrist</option>
          </select>
        </div>

        {!googleSignedIn && (
          <>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password *
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full border rounded-md px-3 py-2 bg-background"
                placeholder="••••••••"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading 
            ? (googleSignedIn ? "Completing registration..." : "Creating account...") 
            : (googleSignedIn ? "Complete Registration" : "Create Doctor Account")}
        </button>
      </form>

      {!googleSignedIn && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-foreground/70">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full px-5 py-2.5 rounded-md border text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Connecting..." : "Register with Google"}
          </button>
        </>
      )}

      <div className="text-center space-y-2">
        <p className="text-sm text-foreground/70">
          Already have an account?{" "}
          <Link href="/doctor/login" className="text-foreground font-medium hover:underline">
            Login here
          </Link>
        </p>
        <p className="text-sm text-foreground/70">
          <Link href="/register" className="text-foreground font-medium hover:underline">
            Register as Patient
          </Link>
        </p>
      </div>
    </div>
  );
}
