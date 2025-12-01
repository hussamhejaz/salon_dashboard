import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

const CONTACTS_API_BASE = `${API_BASE}/api/owner/contacts`;
const DEFAULT_LIMIT = 10;

export function useOwnerContacts() {
  const { isAuthenticated, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    status: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: DEFAULT_LIMIT,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchContacts = useCallback(
    async ({ page = 1, limit = DEFAULT_LIMIT, status = "", search = "" } = {}) => {
      if (!isAuthenticated) {
        const message = "AUTH_REQUIRED";
        setError("Please log in to view contact messages.");
        return { ok: false, error: message };
      }

      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("auth_token");
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (status) {
          params.set("status", status);
        }

        if (search) {
          params.set("search", search);
        }

        const response = await fetch(`${CONTACTS_API_BASE}?${params.toString()}`, {
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
          const message = data.error || "Failed to fetch contact messages.";
          setError(message);
          return data;
        }

        setContacts(data.contacts || []);

        const paginationData = data.pagination || {};

        setPagination({
          page: paginationData.page || page,
          limit: paginationData.limit || limit,
          total:
            typeof paginationData.total === "number"
              ? paginationData.total
              : (data.contacts || []).length,
        });

        return data;
      } catch (err) {
        const message = err?.message || "Failed to fetch contact messages.";
        setError(message);
        return { ok: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, logout]
  );

  useEffect(() => {
    fetchContacts(filters);
  }, [fetchContacts, filters]);

  const setPage = useCallback(
    (page) => {
      setFilters((prev) => ({ ...prev, page }));
    },
    [setFilters]
  );

  const setLimit = useCallback(
    (limit) => {
      setFilters((prev) => ({ ...prev, limit, page: 1 }));
    },
    [setFilters]
  );

  const setStatusFilter = useCallback(
    (status) => {
      setFilters((prev) => ({ ...prev, status, page: 1 }));
    },
    [setFilters]
  );

  const setSearchFilter = useCallback(
    (search) => {
      setFilters((prev) => ({ ...prev, search, page: 1 }));
    },
    [setFilters]
  );

  const refresh = useCallback(() => {
    fetchContacts(filters);
  }, [fetchContacts, filters]);

  const updateContactStatus = useCallback(
    async (contactId, status) => {
      if (!contactId) {
        return { ok: false, error: "MISSING_CONTACT_ID" };
      }

      if (!isAuthenticated) {
        const message = "Please log in to update contacts.";
        setError(message);
        return { ok: false, error: "AUTH_REQUIRED" };
      }

      setError("");

      try {
        const token = localStorage.getItem("auth_token");

        const response = await fetch(`${CONTACTS_API_BASE}/${contactId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ status }),
        });

        if (response.status === 401) {
          logout();
          const message = "Session expired";
          setError(message);
          return { ok: false, error: message };
        }

        const data = await response.json();

        if (!data.ok) {
          const message = data.error || "Failed to update contact message.";
          setError(message);
          return data;
        }

        if (data.contact) {
          setContacts((prev) =>
            prev.map((item) => (item.id === data.contact.id ? data.contact : item))
          );
        }

        return data;
      } catch (err) {
        const message = err?.message || "Failed to update contact message.";
        setError(message);
        return { ok: false, error: message };
      }
    },
    [isAuthenticated, logout]
  );

  return {
    contacts,
    filters,
    pagination,
    loading,
    error,
    refresh,
    setPage,
    setLimit,
    setStatusFilter,
    setSearchFilter,
    updateContactStatus,
  };
}
