"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/appointments", label: "Appointments" },
  { href: "/patients", label: "Patients" },
  { href: "/records", label: "Records" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [userRole, setUserRole] = useState<"patient" | "doctor" | null>(null);
  const [userName, setUserName] = useState<string>("");
  
  const isDoctor = pathname?.startsWith("/doctor") || userRole === "doctor";

  useEffect(() => {
    if (user?.email) {
      // Check user role from database
      fetch(`/api/users/check-role?email=${user.email}`)
        .then(res => res.json())
        .then(data => {
          if (data.role === "doctor") {
            setUserRole("doctor");
            setUserName(data.user.name);
          } else if (data.role === "patient") {
            setUserRole("patient");
            setUserName(data.user.name || user.email);
          }
        })
        .catch(() => {
          setUserRole(null);
        });
    } else {
      setUserRole(null);
      setUserName("");
    }
  }, [user]);

  return (
    <header className="border-b sticky top-0 z-50 bg-background/80 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo / Title - Dynamic based on user role */}
        <div>
          <Link href="/" className="font-bold text-lg flex items-center gap-2">
            {isDoctor ? (
              <>
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <div className="text-sm">Smart Healthcare</div>
                  <div className="text-xs font-normal text-foreground/70">Doctor Portal</div>
                </div>
              </>
            ) : user && userRole === "patient" ? (
              <>
                <span className="text-2xl">👤</span>
                <div>
                  <div className="text-sm">Smart Healthcare</div>
                  <div className="text-xs font-normal text-foreground/70">Patient Portal</div>
                </div>
              </>
            ) : (
              <>
                <span className="text-2xl">🏥</span>
                <span>Smart Healthcare</span>
              </>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* Navigation Links - Only show for non-logged in or patient on public pages */}
          <nav className="hidden md:flex gap-4">
            {!isDoctor && !user && links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10 ${
                  pathname === l.href ? "font-semibold underline underline-offset-4" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* User Info & Actions */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* User Name Display */}
              {userName && (
                <div className="hidden md:block text-sm">
                  <div className="text-foreground/70">Welcome,</div>
                  <div className="font-semibold">{userName}</div>
                </div>
              )}

              {/* Role-specific Navigation */}
              {isDoctor ? (
                <>
                  <Link href="/doctor/dashboard" className="text-sm px-3 py-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/20">
                    📊 Dashboard
                  </Link>
                  <Link href="/doctor/records" className="text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                    📋 Patient Records
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="text-sm px-3 py-2 rounded-md hover:bg-green-100 dark:hover:bg-green-900/20">
                    📊 Dashboard
                  </Link>
                  <Link href="/my-records" className="text-sm px-3 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">
                    📋 My Records
                  </Link>
                </>
              )}

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="text-sm px-3 py-2 rounded-md border hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300"
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="text-sm px-3 py-2 rounded-md bg-foreground text-background hover:opacity-90">
              🔐 Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
