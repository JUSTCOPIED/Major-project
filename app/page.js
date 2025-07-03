"use client";
import React from "react";

export default function Home() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)"
    }}>
      <div style={{
        background: "#fff",
        padding: "2.5rem 2rem 2rem 2rem",
        borderRadius: "1.25rem",
        boxShadow: "0 8px 32px rgba(31, 41, 55, 0.15)",
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 12, color: "#1e293b", letterSpacing: "-1px" }}>
          Major Project
        </h1>
        <p style={{ color: "#64748b", marginBottom: 32, fontSize: 18, textAlign: "center" }}>
          AI automates bias detection in AI systems using Fairlearn, ART, and SHAP. Simulate diverse scenarios, identify unfair outcomes, and ensure compliance with the EU AI Act.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/login" style={{
            background: "#6366f1",
            color: "#fff",
            padding: "0.75rem 1.5rem",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            transition: "background 0.2s"
          }}>Login</a>
          <a href="/signin" style={{
            background: "#fff",
            color: "#6366f1",
            border: "1px solid #6366f1",
            padding: "0.75rem 1.5rem",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            textDecoration: "none",
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
            transition: "background 0.2s"
          }}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}