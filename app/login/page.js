"use client";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/Home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/Home");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #e0e7ff 0%, #f0fdfa 100%)",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2.5rem 2rem 2rem 2rem",
          borderRadius: "1.25rem",
          boxShadow: "0 8px 32px rgba(31, 41, 55, 0.15)",
          width: "100%",
          maxWidth: 400,
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
          Login
        </h1>
        <p
          style={{
            color: "#64748b",
            marginBottom: 24,
          }}
        >
          Please enter your credentials to log in.
        </p>
        <form
          onSubmit={handleLogin}
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              marginBottom: 8,
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "0.75rem 1rem",
              borderRadius: 8,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              marginBottom: 8,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#6366f1",
              color: "#fff",
              padding: "0.75rem 1rem",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: 8,
              transition: "background 0.2s",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            background: "#fff",
            color: "#1e293b",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "0.75rem 1rem",
            fontWeight: 600,
            fontSize: 16,
            marginTop: 16,
            width: "100%",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: 8 }}
          >
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29H37.1C36.5 32.1 34.4 34.7 31.5 36.3V42H39C43.4 38.1 47.5 32.1 47.5 24.5Z"
                fill="#4285F4"
              />
              <path
                d="M24 48C30.6 48 36.2 45.9 39.9 42L32.4 36.3C30.5 37.5 28.3 38.2 24 38.2C18.7 38.2 14.1 34.7 12.5 30.1H4.8V35.1C8.5 42.1 15.7 48 24 48Z"
                fill="#34A853"
              />
              <path
                d="M12.5 30.1C11.9 28.3 11.6 26.3 11.6 24.2C11.6 22.1 11.9 20.1 12.5 18.3V13.3H4.8C2.7 17.1 1.5 21.4 1.5 24.2C1.5 27 2.7 31.3 4.8 35.1L12.5 30.1Z"
                fill="#FBBC05"
              />
              <path
                d="M24 9.8C28.3 9.8 31.5 11.5 33.5 13.3L40 7.1C36.2 3.5 30.6 0.5 24 0.5C15.7 0.5 8.5 6.4 4.8 13.3L12.5 18.3C14.1 13.7 18.7 9.8 24 9.8Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
              </clipPath>
            </defs>
          </svg>
          {loading ? "Please wait..." : "Sign in with Google"}
        </button>
        {error && <p style={{ color: "#ef4444", marginTop: 16 }}>{error}</p>}
        <div
          style={{
            marginTop: 24,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          Don&apos;t have an account?{" "}
          <a
            href="/signin"
            style={{
              color: "#6366f1",
              textDecoration: "underline",
            }}
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}