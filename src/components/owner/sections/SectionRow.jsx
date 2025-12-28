import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ConfirmModal from "../../ui/ConfirmModal";
import { useToast } from "../../ui/useToast";
import { getCategoryPalette, normalizeCategories } from "./categoryPresets";

export default function SectionRow({
  sec,
  categories = [],
  updating,
  deleting,
  onUpdate,
  onDelete,
}) {
  const { t, i18n } = useTranslation();
  const { pushToast } = useToast();
  const isRTL = i18n.dir() === "rtl";

  // Prefer backend categories (labels), fall back to defaults
  const allCategories = useMemo(() => normalizeCategories(categories), [categories]);

  const [isEditing, setIsEditing] = useState(false);
  const [nameVal, setNameVal] = useState(sec.name || "");
  const [descVal, setDescVal] = useState(sec.description || "");
  const [subtitleVal, setSubtitleVal] = useState(sec.subtitle || "");
  const [iconKeyVal, setIconKeyVal] = useState(sec.icon_key || "scissors");
  const [activeVal, setActiveVal] = useState(!!sec.is_active);
  const [featuresVal, setFeaturesVal] = useState(
    Array.isArray(sec.features) ? sec.features.join("\n") : ""
  );
  const [showDelete, setShowDelete] = useState(false);

  const getIconEmoji = (key) => {
    const found = allCategories.find((c) => c.value === key);
    return found ? found.emoji : "⭐";
  };
  const getLabel = (key) => {
    const found = allCategories.find((c) => c.value === key);
    const baseLabel = found ? found.label : key;
    return t(`dashSections.form.categories.${key}`, baseLabel);
  };

  async function handleSave() {
    if (!nameVal.trim()) {
      pushToast({ type: "error", title: t("dashSections.row.nameRequiredToast") });
      return;
    }
    const featuresArray = featuresVal
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const result = await onUpdate(sec.id, {
      name: nameVal.trim(),
      subtitle: subtitleVal.trim() || null,
      description: descVal.trim() || null,
      icon_key: iconKeyVal,
      features: featuresArray,
      is_active: activeVal,
    });

    if (!result?.ok) {
      pushToast({ type: "error", title: t("dashSections.row.updateError") });
      return;
    }

    pushToast({
      type: "success",
      title: t("dashSections.row.savedToastTitle"),
      desc: t("dashSections.row.savedToastDesc"),
    });
    setIsEditing(false);
  }

  async function confirmDelete() {
    setShowDelete(false);
    const result = await onDelete(sec.id);
    if (!result?.ok) {
      pushToast({ type: "error", title: t("dashSections.row.deleteError") });
      return;
    }
    pushToast({
      type: "success",
      title: t("dashSections.row.deletedToastTitle"),
      desc: t("dashSections.row.deletedToastDesc"),
    });
  }

  function cancelEdit() {
    setIsEditing(false);
    setNameVal(sec.name || "");
    setDescVal(sec.description || "");
    setSubtitleVal(sec.subtitle || "");
    setIconKeyVal(sec.icon_key || "scissors");
    setActiveVal(!!sec.is_active);
    setFeaturesVal(Array.isArray(sec.features) ? sec.features.join("\n") : "");
  }

  const palette = getCategoryPalette(isEditing ? iconKeyVal : sec.icon_key);

  return (
    <>
      <tr className="border-b border-white/50 hover:bg-slate-50/40 transition-colors">
        {/* Category */}
        <td className="py-4 pl-6 pr-4">
          {isEditing ? (
            <select
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
              value={iconKeyVal}
              onChange={(e) => setIconKeyVal(e.target.value)}
              disabled={updating}
            >
              {allCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.emoji} {t(`dashSections.form.categories.${c.value}`, c.label)}
                </option>
              ))}
            </select>
          ) : (
            <div className="min-w-[200px]">
              <div className={`relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-r ${palette.gradient} p-3 shadow-inner shadow-slate-900/5`}>
                <div className={`relative flex items-center gap-3 ${isRTL ? "flex-row-reverse text-right" : ""}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/85 shadow-sm shadow-slate-900/10">
                    <span className="text-lg">{getIconEmoji(sec.icon_key)}</span>
                  </div>
                  <div className={`flex flex-col flex-1 min-w-0 ${isRTL ? "items-end text-right" : ""}`}>
                    <span className="font-medium text-slate-900 text-sm block truncate">
                      {getLabel(sec.icon_key)}
                    </span>
                    <div className={`mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600/90 ${isRTL ? "justify-end" : ""}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
                      <span className="truncate uppercase tracking-wide">
                        {t("dashSections.form.serviceCategory")}
                      </span>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        {sec.icon_key}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </td>

        {/* Name + subtitle */}
        <td className="py-4 px-4 align-top">
          {isEditing ? (
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              disabled={updating}
              placeholder={t("dashSections.form.sectionNamePlaceholder")}
            />
          ) : (
            <div className="space-y-1 max-w-[220px]">
              <span className="font-medium block truncate">{sec.name}</span>
              {sec.subtitle && (
                <span className="text-sm text-slate-500 block truncate">
                  {sec.subtitle}
                </span>
              )}
            </div>
          )}
        </td>

        {/* Description */}
        <td className="py-4 px-4 text-slate-600 align-top">
          {isEditing ? (
            <textarea
              rows={2}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20 resize-none"
              value={descVal}
              placeholder={t("dashSections.row.placeholderDesc")}
              onChange={(e) => setDescVal(e.target.value)}
              disabled={updating}
            />
          ) : (
            <span className="text-sm block max-w-[280px] line-clamp-2 break-words">
              {sec.description || (
                <span className="text-slate-400 italic">—</span>
              )}
            </span>
          )}
        </td>

        {/* Features */}
        <td className="py-4 px-4 text-slate-600 align-top">
          {isEditing ? (
            <textarea
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20 resize-none font-mono text-xs"
              value={featuresVal}
              placeholder={t("dashSections.form.featuresPlaceholder")}
              onChange={(e) => setFeaturesVal(e.target.value)}
              disabled={updating}
            />
          ) : (
            <div className="text-xs space-y-1 max-h-20 overflow-y-auto max-w-[260px]">
              {Array.isArray(sec.features) && sec.features.length > 0 ? (
                sec.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-1">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span className="text-slate-600 leading-tight break-words">
                      {f}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400 italic">—</span>
              )}
            </div>
          )}
        </td>

        {/* Status */}
        <td className="py-4 px-4">
          {isEditing ? (
            <select
              className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
              value={activeVal ? "1" : "0"}
              onChange={(e) => setActiveVal(e.target.value === "1")}
              disabled={updating}
            >
              <option value="1">{t("dashSections.row.status.activeLabel")}</option>
              <option value="0">{t("dashSections.row.status.hiddenLabel")}</option>
            </select>
          ) : (
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  sec.is_active ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  sec.is_active ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {sec.is_active
                  ? t("dashSections.row.status.active")
                  : t("dashSections.row.status.hidden")}
              </span>
            </div>
          )}
        </td>

        {/* Actions */}
        <td className="py-4 pr-6 pl-4">
          <div className={`flex items-center ${isRTL ? "justify-start" : "justify-end"} gap-2`}>
            {!isEditing ? (
              <>
                <button
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
                  disabled={deleting || updating}
                  onClick={() => setIsEditing(true)}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  {t("dashSections.row.edit")}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                  disabled={deleting || updating}
                  onClick={() => setShowDelete(true)}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {deleting ? t("dashSections.row.deleting") : t("dashSections.row.delete")}
                </button>
              </>
            ) : (
              <>
                <button
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition disabled:opacity-50"
                  disabled={updating}
                  onClick={cancelEdit}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {t("dashSections.row.cancel")}
                </button>
                <button
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-[#E39B34] px-3 py-1.5 text-xs font-semibold text-white shadow shadow-[#E39B34]/30 transition hover:bg-[#cf8629] disabled:opacity-50"
                  disabled={updating}
                  onClick={handleSave}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {updating ? t("dashSections.row.saving") : t("dashSections.row.save")}
                </button>
              </>
            )}
          </div>
        </td>
      </tr>

      {showDelete && (
        <ConfirmModal
          open={showDelete}
          title={t("dashSections.row.delete")}
          desc={t("dashSections.row.confirmDelete", { name: sec.name })}
          confirmLabel={t("dashSections.row.delete")}
          cancelLabel={t("dashSections.row.cancel")}
          onCancel={() => setShowDelete(false)}
          onConfirm={confirmDelete}
          loading={deleting}
          danger
        />
      )}
    </>
  );
}
