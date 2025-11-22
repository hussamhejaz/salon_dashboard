// src/hooks/owner/useOwnerDashboardSummary.js
import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../../config/api";

export function useOwnerDashboardSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("AUTH_REQUIRED");
      }

      const response = await fetch(`${API_BASE}/api/owner/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload.ok === false) {
        const message = payload.error || `HTTP_ERROR_${response.status}`;
        throw new Error(message);
      }

      setData(payload.dashboard || null);
    } catch (err) {
      console.error("[useOwnerDashboardSummary] fetch error:", err);
      setData(null);
      setError(err.message || "UNKNOWN_ERROR");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    salon: data?.salon || null,
    metrics: data?.metrics || {},
    lists: data?.lists || {},
    charts: data?.charts || {},
    loading,
    error,
    refetch: fetchSummary,
  };
}
