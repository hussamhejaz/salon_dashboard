// src/pages/dashboard/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext"; // Add this import

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth(); // Use the auth context

  const redirectTo = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${API_BASE}/api/owner/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        const detail = data?.error || data?.message || `HTTP ${res.status}`;
        throw new Error(detail || "Login failed");
      }

      // Use the auth context to login
      login(data.token, data.user);

      // Go to dashboard or previous page they wanted
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("login error:", err);
      setErrorMsg(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-sm rounded-xl bg-slate-800 p-6 shadow-xl ring-1 ring-white/10">
        <h1 className="text-white text-lg font-semibold tracking-tight">
          Salon Dashboard Login
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Use the email & password created by Super Admin.
        </p>

        {errorMsg && (
          <div className="mt-4 text-sm text-rose-400">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
          <label className="flex flex-col gap-1 text-slate-300">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Email
            </span>
            <input
              className="rounded-lg bg-slate-900 text-white px-3 py-2 ring-1 ring-white/10 shadow-inner placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E39B34]"
              type="email"
              placeholder="owner@mysalon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="flex flex-col gap-1 text-slate-300">
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              Password
            </span>
            <input
              className="rounded-lg bg-slate-900 text-white px-3 py-2 ring-1 ring-white/10 shadow-inner placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E39B34]"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#E39B34] text-slate-900 text-sm font-semibold px-4 py-2 shadow ring-1 ring-white/10 hover:bg-[#cf8a2b] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-6 text-center leading-relaxed">
          This dashboard is for salon staff only.
        </p>
      </div>
    </div>
  );
}
