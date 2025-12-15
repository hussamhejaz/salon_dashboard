import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../ui/ConfirmModal";

const EmployeesTable = ({
  employees = [],
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const { t } = useTranslation();
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null });

  const openDelete = (employee) => setDeleteModal({ open: true, employee });
  const closeDelete = () => setDeleteModal({ open: false, employee: null });

  const confirmDelete = async () => {
    if (deleteModal.employee && onDelete) {
      await onDelete(deleteModal.employee.id);
    }
    closeDelete();
  };

  const getAssignments = (employee) => {
    return employee.services || [];
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/60 bg-white/85 shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50/70">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t("employees.table.name", "Name")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t("employees.table.role", "Role")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t("employees.table.contact", "Contact")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t("employees.table.services", "Services")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t("employees.table.status", "Status")}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
              {t("employees.table.actions", "Actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white/80">
          {employees.map((employee) => {
            const assignedServices = getAssignments(employee);
            return (
              <tr key={employee.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{employee.full_name}</div>
                  {employee.email && <p className="text-xs text-slate-500">{employee.email}</p>}
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{employee.role || "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <div className="flex flex-col">
                    <span>{employee.phone || "—"}</span>
                    {employee.email && <span className="text-xs text-slate-500">{employee.email}</span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  {assignedServices.length ? (
                    <div className="flex flex-wrap gap-2">
                      {assignedServices.map((service) => (
                        <span
                          key={service.id || service.service_id}
                          className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
                        >
                          {service.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {t("employees.table.noServices", "No services")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      employee.is_active
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    {employee.is_active
                      ? t("employees.status.active", "Active")
                      : t("employees.status.inactive", "Inactive")}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => onEdit?.(employee)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      {t("common.edit", "Edit")}
                    </button>
                    <button
                      onClick={() => onToggleActive?.(employee)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        employee.is_active
                          ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {employee.is_active
                        ? t("employees.actions.deactivate", "Deactivate")
                        : t("employees.actions.activate", "Activate")}
                    </button>
                    <button
                      onClick={() => openDelete(employee)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                    >
                      {t("common.delete", "Delete")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
          {!employees.length && (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-slate-500" colSpan={6}>
                {t("employees.table.empty", "No employees found.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <ConfirmModal
        open={deleteModal.open}
        title={t("employees.delete.title", "Delete employee?")}
        desc={t(
          "employees.delete.desc",
          "This will remove the employee and unassign them from services."
        )}
        confirmLabel={t("common.delete", "Delete")}
        cancelLabel={t("common.cancel", "Cancel")}
        onConfirm={confirmDelete}
        onCancel={closeDelete}
        danger
      />
    </div>
  );
};

export default EmployeesTable;
