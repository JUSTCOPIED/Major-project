"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, database, FIREBASE_ENV_ISSUES } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, runTransaction, set, serverTimestamp, update } from "firebase/database";

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if(u){
        try {
          // Create / update user profile record atomically (basic fields only)
            const userRef = ref(database, `user/${u.uid}/details`);
            if (FIREBASE_ENV_ISSUES.length){
              // eslint-disable-next-line no-console
              console.error("Skipping user profile sync; missing env vars", FIREBASE_ENV_ISSUES);
              return;
            }
            await runTransaction(userRef, (current)=>{
              const now = Date.now();
              if(!current){
                return {
                  uid: u.uid,
                  email: u.email || null,
                  displayName: u.displayName || null,
                  createdAt: now,
                  lastLogin: now,
                  stats: { tests: 0, passRate: null }
                };
              }
              return { ...current, displayName: u.displayName || current.displayName || null, email: u.email || current.email || null, lastLogin: now };
            });
        } catch(err){
          // Swallow user record errors silently to avoid blocking auth flow
          console.warn("User profile sync failed", err);
        }
      }
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
