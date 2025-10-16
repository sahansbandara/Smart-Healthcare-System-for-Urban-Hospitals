"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

function setSessionCookie(token: string | null) {
  if (typeof document === "undefined") {
    return;
  }
  if (token) {
    document.cookie = `session=${token}; path=/; max-age=3600; SameSite=Lax`;
  } else {
    document.cookie = "session=; path=/; max-age=0";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      setLoading(false);
      if (nextUser) {
        const token = await nextUser.getIdToken();
        setSessionCookie(token);
      } else {
        setSessionCookie(null);
      }
    });

    return unsubscribe;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    },
    []
  );

  const signInWithGoogle = useCallback(async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setSessionCookie(null);
    router.push("/login");
  }, [router]);

  const getIdToken = useCallback(async () => {
    if (!user) {
      return null;
    }
    return user.getIdToken();
  }, [user]);

  const value = useMemo(
    () => ({ user, loading, signUp, signIn, signInWithGoogle, logout, getIdToken }),
    [user, loading, signUp, signIn, signInWithGoogle, logout, getIdToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function requireAuth<P extends object>(Component: React.ComponentType<P>) {
  const Guarded = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/login");
      }
    }, [loading, user, router]);

    if (!user) {
      return <div aria-live="polite">Checking authentication…</div>;
    }

    return <Component {...props} />;
  };

  Guarded.displayName = `RequireAuth(${Component.displayName ?? Component.name ?? "Component"})`;

  return Guarded;
}
