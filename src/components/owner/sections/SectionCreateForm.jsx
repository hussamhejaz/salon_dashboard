import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const ICON_EMOJI = {
  scissors: "✂",
  nails: "💅",
  makeup: "💄",
  spa: "🧖",
  star: "⭐",
  facial: "✨",
  massage: "💆",
  waxing: "🔥",
  hair: "👱",
  beard: "🧔",
  eyebrow: "👁",
  treatment: "💊",
};

const DEFAULT_CATS = [
  { value: "scissors", icon: "scissors", label: "Hair Services" },
  { value: "nails", icon: "nails", label: "Nail Care" },
  { value: "makeup", icon: "makeup", label: "Makeup" },
  { value: "spa", icon: "spa", label: "Spa Treatments" },
  { value: "star", icon: "star", label: "Premium Services" },
  { value: "facial", icon: "facial", label: "Facial Care" },
  { value: "massage", icon: "massage", label: "Massage" },
  { value: "waxing", icon: "waxing", label: "Waxing" },
];

export default function SectionCreateForm({
  creating,
  addingCategory,
  categories = [],
  categoriesLoading,
  onCreate,
  onAddCategory,
}) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  // prefer backend categories (with labels), fallback to defaults
  const allCategories = useMemo(() => {
    const base = Array.isArray(categories) && categories.length ? categories : DEFAULT_CATS;
    return base.map((c) => ({
      value: c.value,
      label: c.label || c.value,
      icon: ICON_EMOJI[c.icon] || ICON_EMOJI[c.value] || c.icon || "⭐",
    }));
  }, [categories]);

  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    description: "",
    iconKey: allCategories[0]?.value || "scissors",
    featuresText: "",
  });

  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("scissors");
  // const [focusedField, setFocusedField] = useState(null);
  const [categoryError, setCategoryError] = useState("");

  function parseFeatures(txt) {
    return txt.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    await onCreate({
      name: formData.name.trim(),
      subtitle: formData.subtitle.trim() || null,
      description: formData.description.trim() || null,
      icon_key: formData.iconKey,
      features: parseFeatures(formData.featuresText),
      is_active: true,
    });

    setFormData({
      name: "",
      subtitle: "",
      description: "",
      iconKey: allCategories[0]?.value || "scissors",
      featuresText: "",
    });
  }

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      setCategoryError(t("dashSections.form.nameRequired"));
      return;
    }

    const categoryData = {
      value: newCategoryName.toLowerCase().replace(/\s+/g, "_"),
      label: newCategoryName.trim(),
      icon: newCategoryIcon, // key, not emoji
    };

    const result = await onAddCategory(categoryData);
    if (result.ok) {
      // immediately let user select the new category
      setFormData((p) => ({ ...p, iconKey: categoryData.value }));
      setNewCategoryName("");
      setNewCategoryIcon("scissors");
      setShowAddCategory(false);
      setCategoryError("");
    } else {
      setCategoryError(result.error || t("dashSections.form.errorGeneric"));
    }
  }

  const inputBaseClasses = `w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/15 ${
    isRTL ? "text-right" : "text-left"
  }`;
  const labelClasses = `block text-sm font-medium text-slate-700 mb-2 ${
    isRTL ? "text-right" : "text-left"
  }`;

  return (
    <div className="rounded-2xl border border-white/70 bg-white/85 p-1 shadow-sm shadow-slate-900/5">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Service Category Selection */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className={labelClasses}>{t("dashSections.form.serviceCategory")}</label>
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-2 text-xs text-[#E39B34] font-medium hover:text-[#B8751A] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t("dashSections.form.addCategory")}
            </button>
          </div>

          {/* Add Category Modal */}
          {showAddCategory && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-slate-900/10">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  {t("dashSections.form.addNewCategory")}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t("dashSections.form.categoryName")}
                    </label>
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value);
                        setCategoryError("");
                      }}
                      placeholder={t("dashSections.form.categoryNamePlaceholder")}
                      className={inputBaseClasses}
                    />
                    {categoryError && <p className="text-red-500 text-xs mt-1">{categoryError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {t("dashSections.form.categoryIcon")}
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {Object.keys(ICON_EMOJI).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setNewCategoryIcon(key)}
                          className={`p-2 rounded-lg border-2 text-lg ${
                            newCategoryIcon === key
                              ? "border-[#E39B34] bg-[#FEF6E8]"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                          title={key}
                        >
                          {ICON_EMOJI[key]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCategory(false);
                      setCategoryError("");
                    }}
                    className="flex-1 px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {t("dashSections.form.cancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={addingCategory || !newCategoryName.trim()}
                    className="flex-1 px-4 py-2 bg-[#E39B34] text-white rounded-lg hover:bg-[#B8751A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {addingCategory ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("dashSections.form.saving")}
                      </>
                    ) : (
                      t("dashSections.form.addCategory")
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories Grid */}
          {categoriesLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#E39B34] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {allCategories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleChange("iconKey", c.value)}
                  className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                    formData.iconKey === c.value
                      ? "border-[#E39B34] bg-[#FEF6E8] shadow-md scale-105"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  } ${isRTL ? "text-right" : "text-left"}`}
                >
                  <div
                    className={`flex flex-col items-center gap-2 ${
                      formData.iconKey === c.value ? "text-[#E39B34]" : "text-slate-600"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg text-lg ${
                        formData.iconKey === c.value ? "bg-[#E39B34] text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {c.icon}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight max-w-[120px] truncate">
                      {c.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Name + Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className={labelClasses}>{t("dashSections.form.sectionName")} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={t("dashSections.form.sectionNamePlaceholder")}
              className={`${inputBaseClasses}`}
              required
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>

          <div className="space-y-2">
            <label className={labelClasses}>{t("dashSections.form.subtitle")}</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => handleChange("subtitle", e.target.value)}
              placeholder={t("dashSections.form.subtitlePlaceholder")}
              className={`${inputBaseClasses}`}
              dir={isRTL ? "rtl" : "ltr"}
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className={labelClasses}>{t("dashSections.form.description")}</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder={t("dashSections.form.descriptionPlaceholder")}
            className={`${inputBaseClasses} resize-none`}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* Features */}
        <div className="space-y-2">
          <label className={labelClasses}>{t("dashSections.form.features")}</label>
          <textarea
            rows={4}
            value={formData.featuresText}
            onChange={(e) => handleChange("featuresText", e.target.value)}
            placeholder={t("dashSections.form.featuresPlaceholder")}
            className={`${inputBaseClasses} resize-none font-mono text-sm`}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* Submit */}
        <div className={`flex items-center justify-between pt-6 border-t border-slate-200 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            type="submit"
            disabled={creating || !formData.name.trim()}
            className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-br from-[#E39B34] to-[#B8751A] text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
          >
            {creating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("dashSections.form.saving")}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>{t("dashSections.form.addBtn")}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
