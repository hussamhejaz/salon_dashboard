// src/pages/dashboard/SectionsPageDash.jsx
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSections } from "../../hooks/owner/useSections";
import SectionsTable from "../../components/owner/sections/SectionsTable";
import SectionCreateForm from "../../components/owner/sections/SectionCreateForm";

/**
 * Professional dashboard page header
 */
function PageHeader() {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-[#fef3e6] via-white to-[#f3f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {t("dashSections.tag", "Service groups")}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">
            {t("dashSections.pageHeader.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {t("dashSections.pageHeader.desc")}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-2 text-sm text-slate-600 shadow-sm">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#E39B34]" />
          {t("dashSections.pageSubtitle", "Group your services (Hair, Nails, etc.).")}
        </div>
      </div>
    </div>
  );
}

export default function SectionsPageDash() {
  const { t } = useTranslation();

  const {
    sections,
    categories,
    loading,
    categoriesLoading,
    creating,
    addingCategory,
    updatingId,
    deletingId,
    error,
    addCategory,
    createSection,
    updateSection,
    deleteSection,
  } = useSections();

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  async function onCreate(payload) {
    setFormError("");
    setFormSuccess("");

    const result = await createSection(payload);

    if (!result.ok) {
      setFormError(
        result.error || t("dashSections.form.errorGeneric")
      );
    } else {
      setFormSuccess(t("dashSections.form.added"));
    }
  }

  async function onAddCategory(categoryData) {
    const result = await addCategory(categoryData);
    return result;
  }

  const stats = useMemo(() => [
    {
      label: t("dashSections.stats.total", "Total sections"),
      value: sections.length,
      hint: t("dashSections.stats.totalHint", "All categories"),
    },
    {
      label: t("dashSections.stats.active", "Active sections"),
      value: sections.filter(sec => sec.is_active).length,
      hint: t("dashSections.stats.activeHint", "Visible to staff"),
    },
    {
      label: t("dashSections.stats.categories", "Service categories"),
      value: categories.length,
      hint: t("dashSections.stats.categoriesHint", "Organize services"),
    },
  ], [sections, categories, t]);

  return (
    <section className="space-y-8 text-slate-800 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      {/* PAGE HEADER */}
      <PageHeader />

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* CREATE NEW SECTION CARD */}
      <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
        {/* Card Header */}
        <div className="border-b border-slate-200/70 bg-white/50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E39B34] to-[#B8751A] flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {t("dashSections.cardCreate.title")}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {t("dashSections.cardCreate.subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4">
          {formError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4 flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm text-rose-700">{formError}</p>
            </div>
          )}
          {formSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-emerald-700">{formSuccess}</p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="p-6">
          <SectionCreateForm 
            creating={creating}
            addingCategory={addingCategory}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onCreate={onCreate}
            onAddCategory={onAddCategory}
          />
        </div>
      </div>

      {/* EXISTING SECTIONS CARD */}
      <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
        {/* Card Header */}
        <div className="border-b border-slate-200/70 bg-white/50 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {t("dashSections.list.title")}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {loading
                    ? t("dashSections.list.loading")
                    : t("dashSections.list.count", { count: sections.length })}
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 border border-rose-200">
                <div className="h-2 w-2 bg-rose-500 rounded-full"></div>
                <span className="text-sm text-rose-700">
                  {error || t("dashSections.list.error")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!loading && !error && sections.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-slate-900 mb-2">
                No Sections Created
              </h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                {t("dashSections.list.empty")} Get started by creating your first section above.
              </p>
            </div>
          ) : (
            <div className="mt-4">
              <SectionsTable
                sections={sections}
                categories={categories}
                updatingId={updatingId}
                deletingId={deletingId}
                onUpdate={updateSection}
                onDelete={deleteSection}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
