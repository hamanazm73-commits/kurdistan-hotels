"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, OWNER_EMAIL, firebaseEnabled } from "./firebase";
import type { Role } from "./types";

interface AuthValue {
  user: User | null;
  role: Role | null;
  loading: boolean;
  isOwner: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setRole(await resolveRole(u));
      setLoading(false);
    });
  }, []);

  async function login(email: string, password: string) {
    if (!auth) throw new Error("auth-unavailable");
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    if (auth) await signOut(auth);
  }

  const isOwner = role === "owner";

  return (
    <AuthContext.Provider
      value={{ user, role, loading, isOwner, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

async function resolveRole(u: User | null): Promise<Role | null> {
  if (!u?.email) return null;
  const email = u.email.toLowerCase();
  if (OWNER_EMAIL && email === OWNER_EMAIL) return "owner";
  if (!db) return null;
  try {
    const snap = await getDoc(doc(db, "roles", email));
    if (snap.exists()) {
      const data = snap.data() as { role?: Role; enabled?: boolean };
      if (data.enabled && (data.role === "admin" || data.role === "owner"))
        return data.role;
    }
  } catch {
    /* ignore — treated as no role */
  }
  return null;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
