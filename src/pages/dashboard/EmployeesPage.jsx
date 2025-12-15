import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import EmployeesTable from "../../components/owner/employees/EmployeesTable";
import EmployeeForm from "../../components/owner/employees/EmployeeForm";
import { useEmployees } from "../../hooks/owner/useEmployees";

const EmployeesPage = () => {
  const { t } = useTranslation();
  const {
    employees,
    services,
    stats,
    loading,
    saving,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
  } = useEmployees();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const statCards = useMemo(
    () => [
      {
        label: t("employees.stats.total", "Total employees"),
        value: stats.total,
        hint: t("employees.stats.totalHint", "Everyone on the team"),
      },
      {
        label: t("employees.stats.active", "Active"),
        value: stats.active,
        hint: t("employees.stats.activeHint", "Can be assigned"),
      },
      {
        label: t("employees.stats.inactive", "Inactive"),
        value: stats.inactive,
        hint: t("employees.stats.inactiveHint", "Unavailable for bookings"),
      },
    ],
    [stats, t]
  );

  const handleSubmit = async (payload) => {
    const result = editing
      ? await updateEmployee(editing.id, payload)
      : await createEmployee(payload);
    if (result?.ok) {
      setShowForm(false);
      setEditing(null);
      fetchEmployees(true);
    }
  };

  const handleToggleActive = async (employee) => {
    await updateEmployee(employee.id, { is_active: !employee.is_active });
  };

  const handleEdit = (employee) => {
    setEditing(employee);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
  };

  return (
    <section className="min-h-screen space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 text-slate-800">
      <div className="rounded-3xl border border-white/70 bg-gradient-to-br from-[#fef3e6] via-white to-[#f4f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              {t("employees.titleTag", "Team")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">
              {t("employees.title", "Employees & Staff")}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {t(
                "employees.subtitle",
                "Manage who can perform services, and keep staff assignments up to date."
              )}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8a2f]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            {t("employees.actions.add", "Add employee")}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm backdrop-blur"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {editing ? t("employees.form.editing", "Editing employee") : t("employees.form.new", "New employee")}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">
                {editing?.full_name || t("employees.form.title", "Add staff member")}
              </h3>
            </div>
            <button
              onClick={resetForm}
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-50"
            >
              ✕
            </button>
          </div>
          <EmployeeForm
            services={services}
            initialData={editing}
            saving={saving}
            onSubmit={handleSubmit}
            onCancel={resetForm}
          />
        </div>
      )}

      <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {t("employees.table.title", "Employees list")}
            </h3>
            {error && <p className="text-sm text-rose-600">{error}</p>}
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {t("employees.table.count", { count: employees.length, defaultValue: "{{count}} employees" })}
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative inline-flex h-12 w-12 items-center justify-center">
              <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
                {t("common.loadingShort", "LO")}
              </span>
            </div>
          </div>
        ) : (
          <EmployeesTable
            employees={employees}
            onEdit={handleEdit}
            onDelete={deleteEmployee}
            onToggleActive={handleToggleActive}
          />
        )}
      </div>
    </section>
  );
};

export default EmployeesPage;
