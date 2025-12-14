import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

type AuthContextType = {
  username: string;
  isLoggedIn: boolean;
  login: (usuario: string, clave: string) => Promise<boolean>;
  register: (usuario: string, clave: string) => Promise<boolean>;
  logout: () => Promise<void>;
  lastError: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const normalizeUsername = (u: string): string =>
  u.trim().toLowerCase().replace(/\s+/g, "");

const toEmail = (usuario: string): string => {
  const u = normalizeUsername(usuario);
  if (u.includes("@")) return u;
  return `${u}@todoapp.local`;
};

const emailToUsername = (email: string | null | undefined): string => {
  if (!email) return "";
  const at = email.indexOf("@");
  return at > 0 ? email.slice(0, at) : email;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setIsLoggedIn(!!u);
    });
    return () => unsub();
  }, []);

  const username = useMemo(() => {
    return emailToUsername(firebaseUser?.email);
  }, [firebaseUser]);

  const register = async (usuario: string, clave: string): Promise<boolean> => {
    setLastError("");

    const u = normalizeUsername(usuario);
    const c = clave.trim();

    if (!u) {
      setLastError("Usuario vacío.");
      return false;
    }
    if (c.length < 6) {
      setLastError("La contraseña debe tener al menos 6 caracteres.");
      return false;
    }

    try {
      await createUserWithEmailAndPassword(auth, toEmail(u), c);
      return true;
    } catch (err: unknown) {
      console.error("Firebase register error:", err);

      if (err instanceof Error) {
        setLastError(err.message);
      } else {
        setLastError("Error al registrar.");
      }
      return false;
    }
  };

  const login = async (usuario: string, clave: string): Promise<boolean> => {
    setLastError("");

    const u = normalizeUsername(usuario);
    const c = clave.trim();

    if (!u || !c) {
      setLastError("Completa usuario y contraseña.");
      return false;
    }

    try {
      await signInWithEmailAndPassword(auth, toEmail(u), c);
      return true;
    } catch (err: unknown) {
      console.error("Firebase login error:", err);

      if (err instanceof Error) {
        setLastError(err.message);
      } else {
        setLastError("Error al iniciar sesión.");
      }
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    setLastError("");
    return signOut(auth);
  };

  const value: AuthContextType = {
    username,
    isLoggedIn,
    login,
    register,
    logout,
    lastError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return ctx;
};