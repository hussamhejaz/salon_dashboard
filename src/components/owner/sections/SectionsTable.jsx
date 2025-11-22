// src/components/sections/SectionsTable.jsx
import { useTranslation } from "react-i18next";
import SectionRow from "./SectionRow";

export default function SectionsTable({
  sections,
  categories = [],
  updatingId,
  deletingId,
  onUpdate,
  onDelete,
}) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-sm shadow-slate-900/5 backdrop-blur">
      <table className="min-w-full">
        {/* Table Header */}
        <thead className="border-b border-white/60 bg-white/70">
          <tr>
            <th className="py-4 pl-6 pr-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {t("dashSections.form.serviceCategory")}
            </th>
            <th className="py-4 px-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {t("dashSections.table.colSection")}
            </th>
            <th className="py-4 px-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {t("dashSections.table.colDescription")}
            </th>
            <th className="py-4 px-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {t("dashSections.form.features")}
            </th>
            <th className="py-4 px-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {t("dashSections.table.colStatus")}
            </th>
            <th className="py-4 pr-6 pl-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wide">
              {t("dashSections.table.colActions")}
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-200/40">
          {sections.map((sec) => (
            <SectionRow
              key={sec.id}
              sec={sec}
              categories={categories}
              updating={updatingId === sec.id}
              deleting={deletingId === sec.id}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
