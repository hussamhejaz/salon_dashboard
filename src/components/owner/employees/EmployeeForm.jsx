import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { formInputClass } from "../../../utils/uiClasses";

const EmployeeForm = ({
  services = [],
  initialData = null,
  saving = false,
  onSubmit,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: "",
    role: "",
    phone: "",
    email: "",
    is_active: true,
    service_ids: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        full_name: initialData.full_name || "",
        role: initialData.role || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        is_active: initialData.is_active ?? true,
        service_ids: (initialData.services || []).map((s) => s.id || s.service_id),
      });
    } else {
      setForm({
        full_name: "",
        role: "",
        phone: "",
        email: "",
        is_active: true,
        service_ids: [],
      });
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const toggleService = (serviceId) => {
    setForm((prev) => {
      const exists = prev.service_ids.includes(serviceId);
      return {
        ...prev,
        service_ids: exists
          ? prev.service_ids.filter((id) => id !== serviceId)
          : [...prev.service_ids, serviceId],
      };
    });
  };

  const validate = () => {
    const next = {};
    if (!form.full_name.trim()) {
      next.full_name = t("employees.errors.nameRequired", "Full name is required");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(form);
  };

  const sortedServices = useMemo(
    () => [...services].sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [services]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            {t("employees.form.fullName", "Full name")} *
          </label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            className={`${formInputClass} ${errors.full_name ? "border-rose-300" : ""}`}
            placeholder={t("employees.form.fullNamePlaceholder", "Employee name")}
          />
          {errors.full_name && (
            <p className="mt-1 text-xs text-rose-600">{errors.full_name}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            {t("employees.form.role", "Role")}
          </label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            className={formInputClass}
            placeholder={t("employees.form.rolePlaceholder", "Stylist, assistant...")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            {t("employees.form.phone", "Phone")}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className={formInputClass}
            placeholder={t("employees.form.phonePlaceholder", "+9665...")}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            {t("employees.form.email", "Email")}
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={formInputClass}
            placeholder={t("employees.form.emailPlaceholder", "name@email.com")}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => handleChange("is_active", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
          />
          {t("employees.form.active", "Active")}
        </label>
        <p className="text-xs text-slate-500">
          {t("employees.form.activeHint", "Inactive staff cannot be assigned to bookings.")}
        </p>
      </div>

      <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-inner shadow-slate-900/5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">
            {t("employees.form.services", "Services they can perform")}
          </p>
          <span className="text-xs text-slate-500">
            {t("employees.form.multiSelectHint", "Select one or more services")}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {sortedServices.map((service) => {
            const checked = form.service_ids.includes(service.id);
            return (
              <label
                key={service.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                  checked
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service.id)}
                    className="h-4 w-4 rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
                  />
                  <span className="font-semibold">{service.name}</span>
                </div>
                {service.duration_minutes ? (
                  <span className="text-xs text-slate-500">
                    {service.duration_minutes} {t("pricing.table.min", "min")}
                  </span>
                ) : null}
              </label>
            );
          })}
          {!sortedServices.length && (
            <p className="text-sm text-slate-500">
              {t("employees.form.noServices", "No services available yet. Add services first.")}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {t("common.cancel", "Cancel")}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8a2f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />}
          {initialData
            ? t("employees.form.update", "Update employee")
            : t("employees.form.create", "Create employee")}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
