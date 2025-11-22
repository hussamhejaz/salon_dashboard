import { useCallback, useState } from "react";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const REVIEWS_API_BASE = `${API_BASE}/api/owner/reviews`;
const DEFAULT_LIMIT = 12;
export const REVIEWS_PAGE_LIMIT = DEFAULT_LIMIT;

export function useOwnerReviews() {
  const { isAuthenticated, logout } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
  });

  const clearError = useCallback(() => setError(null), []);

  const fetchReviews = useCallback(
    async (page = 1, limit = DEFAULT_LIMIT) => {
      if (!isAuthenticated()) {
        setError("Please log in to view reviews");
        return { ok: false, error: "AUTH_REQUIRED" };
      }

      setLoading(true);
      clearError();

      try {
        const token = localStorage.getItem("auth_token");
        const params = new URLSearchParams({ page, limit });
        const response = await fetch(`${REVIEWS_API_BASE}?${params.toString()}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (response.status === 401) {
          logout();
          const message = "Session expired";
          setError(message);
          return { ok: false, error: message };
        }

        const data = await response.json();

        if (!data.ok) {
          const message = data.error || "Unable to load reviews";
          setError(message);
          return data;
        }

        setReviews(data.reviews || []);
        setPagination({
          page: data.page || page,
          limit: data.limit || limit,
          total:
            typeof data.total === "number" ? data.total : (data.reviews || []).length,
        });

        return data;
      } catch (err) {
        if (err.name === "AbortError") {
          throw err;
        }
        const message = err.message || "Failed to load reviews";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [clearError, isAuthenticated, logout]
  );

  const updateReview = useCallback(
    async (reviewId, updates) => {
      if (!isAuthenticated()) {
        setError("Please log in to update reviews");
        return { ok: false, error: "AUTH_REQUIRED" };
      }

      clearError();

      try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch(`${REVIEWS_API_BASE}/${reviewId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(updates),
        });

        if (response.status === 401) {
          logout();
          const message = "Session expired";
          setError(message);
          return { ok: false, error: message };
        }

        const data = await response.json();

        if (!data.ok) {
          const message = data.error || "Unable to update review";
          setError(message);
          return data;
        }

        const updatedReview = data.review || data.data || data.updated_review;

        if (updatedReview) {
          setReviews((prev) =>
            prev.map((item) => (item.id === reviewId ? updatedReview : item))
          );
        } else if (updates.metadata) {
          setReviews((prev) =>
            prev.map((item) =>
              item.id === reviewId
                ? { ...item, metadata: { ...item.metadata, ...updates.metadata } }
                : item
            )
          );
        }

        return data;
      } catch (err) {
        const message = err.message || "Failed to update review";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [clearError, isAuthenticated, logout]
  );

  return {
    reviews,
    loading,
    error,
    pagination,
    fetchReviews,
    updateReview,
    clearError,
  };
}
