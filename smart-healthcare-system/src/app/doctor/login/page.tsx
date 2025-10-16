"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../components/AuthProvider";

export default function DoctorLoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1: Verify doctor exists in MongoDB
      console.log('Checking doctor account in MongoDB...');
      const verifyRes = await fetch('/api/doctors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || "No doctor account found. Please register first.");
        setLoading(false);
        return;
      }

      const doctorData = await verifyRes.json();
      console.log('Doctor verified in MongoDB:', doctorData.doctor.name);

      // Step 2: Authenticate with Firebase
      console.log('Authenticating with Firebase...');
      await signIn(email, password);
      
      console.log('Login successful, redirecting to dashboard...');
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Failed to login. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      // Step 1: Authenticate with Google/Firebase
      console.log('Signing in with Google...');
      const result = await signInWithGoogle();
      const userEmail = result.user?.email;
      
      if (!userEmail) {
        setError("Failed to get email from Google account.");
        setLoading(false);
        return;
      }

      console.log('Google sign-in successful, email:', userEmail);
      
      // Step 2: Verify doctor exists in MongoDB
      console.log('Checking doctor account in MongoDB...');
      const verifyRes = await fetch('/api/doctors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      
      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setError(data.error || "No doctor account found. Please register first.");
        setLoading(false);
        return;
      }

      const doctorData = await verifyRes.json();
      console.log('Doctor verified in MongoDB:', doctorData.doctor.name);
      
      console.log('Login successful, redirecting to dashboard...');
      router.push("/doctor/dashboard");
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || "Failed to login with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Doctor Login</h1>
        <p className="text-foreground/70 mt-2">Access your doctor dashboard</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleEmailLogin} className="border rounded-lg p-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="doctor@hospital.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-background"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-5 py-2.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login with Email"}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-foreground/70">Or continue with</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
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
        {loading ? "Connecting..." : "Login with Google"}
      </button>

      <div className="text-center space-y-2">
        <p className="text-sm text-foreground/70">
          Don't have a doctor account?{" "}
          <Link href="/doctor/register" className="text-foreground font-medium hover:underline">
            Register here
          </Link>
        </p>
        <p className="text-sm text-foreground/70">
          <Link href="/login" className="text-foreground font-medium hover:underline">
            Login as Patient
          </Link>
        </p>
      </div>
    </div>
  );
}
