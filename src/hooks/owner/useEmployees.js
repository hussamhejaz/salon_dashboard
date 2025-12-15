import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../config/api";
import { ToastCtx } from "../../components/ui/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { clearOwnerAuthTokens, getOwnerAuthToken } from "../../utils/authToken";

export function useEmployees() {
  const { t } = useTranslation();
  const { pushToast } = useContext(ToastCtx);
  const { logout } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [serviceAssignments, setServiceAssignments] = useState({});
  const [serviceEmployeesLoading, setServiceEmployeesLoading] = useState(false);

  const authHeaders = useCallback((token) => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token || ""}`,
  }), []);

  const handleUnauthorized = useCallback(
    (message) => {
      const fallback = t("auth.errors.unauthorized", "Unauthorized. Please sign in again.");
      setError(message || fallback);
      clearOwnerAuthTokens();
      logout();
    },
    [logout, t]
  );

  const requireToken = useCallback(() => {
    const token = getOwnerAuthToken();
    if (!token) {
      handleUnauthorized(t("auth.errors.unauthorized", "Please log in to view employees."));
      return null;
    }
    return token;
  }, [handleUnauthorized, t]);

  const buildServiceMap = useCallback((list = []) => {
    const map = {};
    list.forEach((employee) => {
      (employee.services || []).forEach((service) => {
        const serviceId = service.id || service.service_id;
        if (!serviceId) return;
        if (!map[serviceId]) map[serviceId] = [];
        map[serviceId].push(employee);
      });
    });
    setServiceAssignments(map);
  }, []);

  const fetchEmployees = useCallback(async (includeServices = true) => {
    const token = requireToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const query = includeServices ? "?include_services=true" : "";
      const res = await fetch(`${API_BASE}/api/owner/employees${query}`, {
        headers: authHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data.error ||
          (res.status === 401
            ? t("auth.errors.unauthorized", "Unauthorized. Please sign in again.")
            : "Failed to load employees");
        if (res.status === 401) {
          handleUnauthorized(message);
          return;
        }
        setError(message);
        throw new Error(message);
      }
      const list = data.employees || [];
      setEmployees(list);
      if (includeServices) {
        buildServiceMap(list);
      }
    } catch (err) {
      setError(err.message || "Failed to load employees");
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.fetch", "Failed to load employees"),
      });
    } finally {
      setLoading(false);
    }
  }, [authHeaders, buildServiceMap, handleUnauthorized, pushToast, requireToken, t]);

  const fetchServices = useCallback(async () => {
    const token = requireToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/owner/services`, {
        headers: authHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data.error ||
          (res.status === 401
            ? t("auth.errors.unauthorized", "Unauthorized. Please sign in again.")
            : "Failed to load services");
        if (res.status === 401) {
          handleUnauthorized(message);
          return;
        }
        throw new Error(message);
      }
      setServices(data.services || []);
    } catch (err) {
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.fetchServices", "Failed to load services"),
      });
    }
  }, [authHeaders, handleUnauthorized, pushToast, requireToken, t]);

  const createEmployee = useCallback(async (payload) => {
    const token = requireToken();
    if (!token) {
      return { ok: false, error: t("auth.errors.unauthorized", "Unauthorized. Please sign in again.") };
    }
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/owner/employees`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          handleUnauthorized(data.error);
          return { ok: false, error: data.error };
        }
        throw new Error(data.error || "Failed to create employee");
      }
      setEmployees((prev) => [data.employee, ...prev]);
      if (payload.service_ids?.length) {
        fetchEmployees(true);
      } else {
        buildServiceMap([...employees, data.employee]);
      }
      pushToast?.({
        type: "success",
        title: t("common.success", "Success"),
        desc: t("employees.messages.created", "Employee created"),
      });
      return { ok: true, employee: data.employee };
    } catch (err) {
      setError(err.message || "Failed to create employee");
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.create", "Failed to create employee"),
      });
      return { ok: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [authHeaders, buildServiceMap, employees, fetchEmployees, handleUnauthorized, pushToast, requireToken, t]);

  const updateEmployee = useCallback(async (employeeId, payload) => {
    const token = requireToken();
    if (!token) {
      return { ok: false, error: t("auth.errors.unauthorized", "Unauthorized. Please sign in again.") };
    }
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/owner/employees/${employeeId}`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          handleUnauthorized(data.error);
          return { ok: false, error: data.error };
        }
        throw new Error(data.error || "Failed to update employee");
      }
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? data.employee : emp))
      );
      if (payload.service_ids) {
        fetchEmployees(true);
      } else {
        buildServiceMap(
          employees.map((emp) => (emp.id === employeeId ? data.employee : emp))
        );
      }
      pushToast?.({
        type: "success",
        title: t("common.success", "Success"),
        desc: t("employees.messages.updated", "Employee updated"),
      });
      return { ok: true, employee: data.employee };
    } catch (err) {
      setError(err.message || "Failed to update employee");
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.update", "Failed to update employee"),
      });
      return { ok: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [authHeaders, buildServiceMap, employees, fetchEmployees, handleUnauthorized, pushToast, requireToken, t]);

  const deleteEmployee = useCallback(async (employeeId) => {
    const token = requireToken();
    if (!token) {
      return { ok: false, error: t("auth.errors.unauthorized", "Unauthorized. Please sign in again.") };
    }
    try {
      setSaving(true);
      setError("");
      const res = await fetch(`${API_BASE}/api/owner/employees/${employeeId}`, {
        method: "DELETE",
        headers: authHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data.error ||
          data.message ||
          (data.code === "EMPLOYEE_IN_USE"
            ? t("employees.errors.inUse", "Cannot delete: employee is assigned to bookings.")
            : null) ||
          (res.status === 500
            ? t("employees.errors.deleteServer", "Server error while deleting employee. Please try again.")
            : t("employees.errors.delete", "Failed to delete employee"));
        if (res.status === 401) {
          handleUnauthorized(message);
          return { ok: false, error: message };
        }
        throw new Error(message);
      }
      const next = employees.filter((emp) => emp.id !== employeeId);
      setEmployees(next);
      buildServiceMap(next);
      pushToast?.({
        type: "success",
        title: t("common.success", "Success"),
        desc: t("employees.messages.deleted", "Employee deleted"),
      });
      return { ok: true };
    } catch (err) {
      setError(err.message || "Failed to delete employee");
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.delete", "Failed to delete employee"),
      });
      return { ok: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [authHeaders, buildServiceMap, employees, handleUnauthorized, pushToast, requireToken, t]);

  const fetchEmployeesForService = useCallback(async (serviceId) => {
    if (!serviceId) return [];
    const token = requireToken();
    if (!token) return [];
    try {
      setServiceEmployeesLoading(true);
      const res = await fetch(`${API_BASE}/api/owner/employees/by-service/${serviceId}`, {
        headers: authHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          data.error ||
          (res.status === 401
            ? t("auth.errors.unauthorized", "Unauthorized. Please sign in again.")
            : "Failed to load employees for service");
        if (res.status === 401) {
          handleUnauthorized(message);
          return [];
        }
        throw new Error(message);
      }
      return data.employees || [];
    } catch (err) {
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.fetch", "Failed to load employees"),
      });
      return [];
    } finally {
      setServiceEmployeesLoading(false);
    }
  }, [authHeaders, handleUnauthorized, pushToast, requireToken, t]);

  const saveServiceAssignments = useCallback(async (serviceId, employeeIds) => {
    const token = requireToken();
    if (!token) {
      return { ok: false, error: t("auth.errors.unauthorized", "Unauthorized. Please sign in again.") };
    }
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/owner/employees/by-service/${serviceId}`, {
        method: "PUT",
        headers: authHeaders(token),
        body: JSON.stringify({ employee_ids: employeeIds || [] }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 401) {
          handleUnauthorized(data.error);
          return { ok: false, error: data.error };
        }
        throw new Error(data.error || "Failed to update service employees");
      }
      await fetchEmployees(true);
      pushToast?.({
        type: "success",
        title: t("common.success", "Success"),
        desc: t("employees.messages.assignmentsSaved", "Assignments updated"),
      });
      return { ok: true };
    } catch (err) {
      pushToast?.({
        type: "error",
        title: t("common.error", "Error"),
        desc: err.message || t("employees.errors.updateAssignments", "Failed to update assignments"),
      });
      return { ok: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [authHeaders, fetchEmployees, handleUnauthorized, pushToast, requireToken, t]);

  useEffect(() => {
    fetchEmployees(true);
    fetchServices();
  }, [fetchEmployees, fetchServices]);

  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.is_active).length;
    return {
      total,
      active,
      inactive: total - active,
    };
  }, [employees]);

  return {
    employees,
    services,
    serviceAssignments,
    stats,
    loading,
    saving,
    serviceEmployeesLoading,
    error,
    fetchEmployees,
    fetchServices,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployeesForService,
    saveServiceAssignments,
  };
}
