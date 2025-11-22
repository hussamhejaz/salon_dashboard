// src/hooks/useSections.js
import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../../config/api";

export function useSections() {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // form create loading
  const [creating, setCreating] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  // row loading
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  function getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  }

  // GET all service categories
  const fetchCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/owner/sections/categories`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Failed to load categories");
      }

      setCategories(data.categories || []);
    } catch (err) {
      console.error("[useSections] fetchCategories error:", err);
      // Don't set error for categories failure, use defaults
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  // POST create new category
  const addCategory = useCallback(async (categoryData) => {
    try {
      setAddingCategory(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/owner/sections/categories`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Failed to create category");
      }

      // Add new category to the list
      setCategories(prev => [...prev, data.category]);

      return { ok: true, category: data.category };
    } catch (err) {
      console.error("[useSections] addCategory error:", err);
      return { ok: false, error: err.message };
    } finally {
      setAddingCategory(false);
    }
  }, []);

  // GET all sections
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/api/owner/sections`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Failed to load sections");
      }

      setSections(data.sections || []);
    } catch (err) {
      console.error("[useSections] fetchSections error:", err);
      setError(err.message || "Failed to load sections");
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // POST create
  const createSection = useCallback(
    async ({
      name,
      subtitle,
      description,
      features,
      icon_key,
      is_active = true,
    }) => {
      try {
        setCreating(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/owner/sections`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            name,
            subtitle,
            description,
            features,
            icon_key,
            is_active,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.ok === false) {
          throw new Error(data.error || "Failed to create section");
        }

        // prepend new row
        setSections((prev) => [data.section, ...prev]);

        return { ok: true };
      } catch (err) {
        console.error("[useSections] createSection error:", err);
        setError(err.message || "Failed to create section");
        return { ok: false, error: err.message };
      } finally {
        setCreating(false);
      }
    },
    []
  );

  // PATCH update
  const updateSection = useCallback(async (sectionId, payload) => {
    try {
      setUpdatingId(sectionId);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/owner/sections/${sectionId}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Failed to update section");
      }

      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? data.section : s))
      );

      return { ok: true };
    } catch (err) {
      console.error("[useSections] updateSection error:", err);
      setError(err.message || "Failed to update section");
      return { ok: false, error: err.message };
    } finally {
      setUpdatingId(null);
    }
  }, []);

  // DELETE
  const deleteSection = useCallback(async (sectionId) => {
    try {
      setDeletingId(sectionId);
      setError("");

      const res = await fetch(
        `${API_BASE}/api/owner/sections/${sectionId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "Failed to delete section");
      }

      setSections((prev) => prev.filter((s) => s.id !== sectionId));

      return { ok: true };
    } catch (err) {
      console.error("[useSections] deleteSection error:", err);
      setError(err.message || "Failed to delete section");
      return { ok: false, error: err.message };
    } finally {
      setDeletingId(null);
    }
  }, []);

  useEffect(() => {
    fetchSections();
    fetchCategories();
  }, [fetchSections, fetchCategories]);

  return {
    sections,
    categories,
    loading,
    categoriesLoading,
    creating,
    addingCategory,
    updatingId,
    deletingId,
    error,
    fetchSections,
    fetchCategories,
    addCategory,
    createSection,
    updateSection,
    deleteSection,
  };
}
