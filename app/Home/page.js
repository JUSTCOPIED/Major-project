"use client";
import React, { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";

export default function HomeDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    window.location.reload();
  };

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: 100 }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h2>You are not logged in.</h2>
        <a href="/login" style={{ color: "#6366f1", textDecoration: "underline" }}>
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0fdfa 0%, #e0e7ff 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2.5rem 2rem 2rem 2rem",
          borderRadius: "1.25rem",
          boxShadow: "0 8px 32px rgba(31, 41, 55, 0.15)",
          width: "100%",
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: 8,
            color: "#1e293b",
          }}
        >
          Welcome, {user.displayName || user.email}!
        </h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>
          This is your personalized dashboard.
        </p>
        <button
          onClick={handleLogout}
          style={{
            background: "#ef4444",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            marginTop: 8,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            transition: "background 0.2s",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
