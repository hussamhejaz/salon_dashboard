import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../config/api";
import { useToast } from "../../components/ui/useToast";
import DashboardHeroHeader from "../../components/dashboard/DashboardHeroHeader";
import RiyalIcon from "../../components/RiyalIcon";
import { formInputClass } from "../../utils/uiClasses";

export default function PricingPage() {
  const { t, i18n } = useTranslation();
  const { pushToast } = useToast();

  const [sections, setSections] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingService, setCreatingService] = useState(false);
  const [updatingService, setUpdatingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [selectedSection, setSelectedSection] = useState("all");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    section_id: "",
    name: "",
    description: "",
    price: "",
    duration_minutes: 30,
    features: [{ name: "", is_checked: false }],
  });
  const [serviceSlots, setServiceSlots] = useState([]);
  const [slotForm, setSlotForm] = useState({
    slot_time: "",
    duration_minutes: 30,
    is_active: true,
  });
  const [slotsError, setSlotsError] = useState("");

  const sortedSlots = useMemo(() => {
    return [...serviceSlots].sort((a, b) => a.slot_time.localeCompare(b.slot_time));
  }, [serviceSlots]);

  const heroHighlights = useMemo(() => {
    const totalServices = services.length;
    const totalSections = sections.length;
    const activeServices = services.filter((s) => s.is_active).length;
    const avgPrice =
      totalServices > 0
        ? Math.round(services.reduce((sum, s) => sum + parseFloat(s.price || 0), 0) / totalServices)
        : 0;

    return [
      {
        label: t("pricing.stats.totalServices"),
        value: totalServices,
        hint: t("pricing.stats.totalServicesHint", "All offerings"),
      },
      {
        label: t("pricing.stats.totalSections"),
        value: totalSections,
        hint: t("pricing.stats.totalSectionsHint", "Organized groups"),
      },
      {
        label: t("pricing.stats.activeServices"),
        value: activeServices,
        hint: t("pricing.stats.activeServicesHint", "Visible to clients"),
      },
      {
        label: t("pricing.stats.avgPrice"),
        value: (
          <span className="inline-flex items-center gap-1">
            <RiyalIcon size={16} />
            {avgPrice}
          </span>
        ),
        hint: t("pricing.stats.avgPriceHint", "Per service"),
      },
    ];
  }, [services, sections, t]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
    };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const sectionsRes = await fetch(`${API_BASE}/api/owner/sections`, { headers: getAuthHeaders() });
      const sectionsData = await sectionsRes.json();
      if (sectionsData.ok) setSections(sectionsData.sections || []);

      const servicesRes = await fetch(`${API_BASE}/api/owner/services`, { headers: getAuthHeaders() });
      const servicesData = await servicesRes.json();
      if (servicesData.ok) setServices(servicesData.services || []);
    } catch (error) {
      console.error("Failed to load pricing data", error);
      pushToast({ type: "error", title: t("pricing.errors.fetchFailed") });
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, pushToast, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredServices =
    selectedSection === "all" ? services : services.filter((service) => service.section_id === selectedSection);

  const servicesBySection = filteredServices.reduce((acc, service) => {
    const sectionId = service.section_id;
    if (!acc[sectionId]) {
      acc[sectionId] = { section: sections.find((s) => s.id === sectionId), services: [] };
    }
    acc[sectionId].services.push(service);
    return acc;
  }, {});

  function resetForm() {
    setFormData({
      section_id: sections[0]?.id || "",
      name: "",
      description: "",
      price: "",
      duration_minutes: 30,
      features: [{ name: "", is_checked: false }],
    });
    setServiceSlots([]);
    setSlotForm({
      slot_time: "",
      duration_minutes: 30,
      is_active: true,
    });
    setEditingService(null);
    setShowServiceForm(false);
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleFeatureChange(index, field, value) {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, i) => (i === index ? { ...feature, [field]: value } : feature)),
    }));
  }

  function addFeature() {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { name: "", is_checked: false }],
    }));
  }

  function removeFeature(index) {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  }

  function handleSlotInputChange(field, value) {
    setSlotForm((prev) => ({
      ...prev,
      [field]: field === "duration_minutes" ? parseInt(value, 10) || 0 : value,
    }));
  }

  function handleAddSlot() {
    if (!slotForm.slot_time) {
      setSlotsError(t("availability.errors.fetchSlots", "Slot time is required"));
      return;
    }

    if (serviceSlots.some((slot) => slot.slot_time === slotForm.slot_time)) {
      setSlotsError(t("availability.errors.noSlots", "Slot already defined"));
      return;
    }

    setSlotsError("");
    const normalizedSlot = {
      ...slotForm,
      duration_minutes: slotForm.duration_minutes || 30,
      is_active: slotForm.is_active !== undefined ? slotForm.is_active : true,
      id: slotForm.slot_time,
    };

    setServiceSlots((prev) => [...prev, normalizedSlot]);
    setSlotForm({
      slot_time: "",
      duration_minutes: 30,
      is_active: true,
    });
  }

  function handleRemoveSlot(slotId) {
    setServiceSlots((prev) =>
      prev.filter((slot) => (slot.id || slot.slot_time) !== slotId)
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.section_id || !formData.name.trim() || !formData.price) {
      pushToast({ type: "error", title: t("pricing.errors.missingFields") });
      return;
    }

    const payload = {
      ...formData,
      slots: serviceSlots.map((slot) => ({
        slot_time: slot.slot_time,
        duration_minutes: slot.duration_minutes,
        is_active: slot.is_active,
      })),
    };

    try {
      if (editingService) {
        setUpdatingService(editingService.id);
        await updateService(editingService.id, payload);
      } else {
        setCreatingService(true);
        await createService(payload);
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Failed to save service", error);
      pushToast({ type: "error", title: t("pricing.errors.saveFailed") });
    } finally {
      setCreatingService(false);
      setUpdatingService(null);
    }
  }

  async function createService(serviceData) {
    const res = await fetch(`${API_BASE}/api/owner/sections/${serviceData.section_id}/services`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...serviceData,
        price: parseFloat(serviceData.price),
        features: serviceData.features.filter((f) => f.name.trim()),
        slots: serviceData.slots || [],
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || data.details || "Failed to create service");
    }
    pushToast({ type: "success", title: t("pricing.success.created") });
  }

  async function updateService(serviceId, serviceData) {
    const res = await fetch(`${API_BASE}/api/owner/services/${serviceId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        ...serviceData,
        price: parseFloat(serviceData.price),
        features: serviceData.features.filter((f) => f.name.trim()),
        slots: serviceData.slots || [],
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || data.details || "Failed to update service");
    }
    pushToast({ type: "success", title: t("pricing.success.updated") });
  }

  async function deleteService(serviceId) {
    try {
      setDeletingService(serviceId);
      const res = await fetch(`${API_BASE}/api/owner/services/${serviceId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to delete service");
      pushToast({ type: "success", title: t("pricing.success.deleted") });
      fetchData();
    } catch (error) {
      console.error("Failed to delete service", error);
      pushToast({ type: "error", title: t("pricing.errors.deleteFailed") });
    } finally {
      setDeletingService(null);
    }
  }

  function handleEditService(service) {
    setEditingService(service);
    setFormData({
      section_id: service.section_id,
      name: service.name,
      description: service.description || "",
      price: service.price.toString(),
      duration_minutes: service.duration_minutes || 30,
      features:
        service.service_features && service.service_features.length > 0
          ? service.service_features
          : [{ name: "", is_checked: false }],
    });
    loadServiceSlots(service.id);
    setShowServiceForm(true);
  }

  async function loadServiceSlots(serviceId) {
    if (!serviceId) {
      setServiceSlots([]);
      return;
    }
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/owner/services/${serviceId}/slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setServiceSlots(data.slots || []);
      } else {
        setServiceSlots([]);
      }
    } catch (err) {
      console.error("Failed to load service slots:", err);
      setServiceSlots([]);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] flex items-center justify-center">
        <div className="relative inline-flex h-12 w-12 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
            {t("common.loadingShort", "LO")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 text-slate-800 min-h-screen">
      <DashboardHeroHeader
        tagLabel={t("pricing.tag", "Services & Pricing")}
        title={t("pricing.pageHeader.title")}
        description={t("pricing.pageHeader.desc")}
        highlights={heroHighlights}
      />

      <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/60 bg-white/85 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-600">{t("pricing.actions.filterBySection")}</label>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className={`${formInputClass} w-48`}
          >
            <option value="all">{t("pricing.table.allSections")}</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowServiceForm(true)}
          className="group inline-flex items-center gap-3 rounded-2xl bg-[#E39B34] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t("pricing.actions.addService")}
        </button>
      </div>


      {showServiceForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur overflow-hidden max-h-[calc(100vh-3rem)] flex flex-col">
            <div className="border-b border-white/60 px-6 py-4">
              <h3 className="text-xl font-semibold text-slate-900">
                {editingService ? t("pricing.modal.editService") : t("pricing.modal.addService")}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
              <div
                className="overflow-y-auto px-6 py-6 space-y-6 bg-white/90"
                style={{ maxHeight: "calc(90vh - 13rem)" }}
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    {t("pricing.form.sectionRequired")}
                  </label>
                  <select
                    value={formData.section_id}
                    onChange={(e) => handleInputChange("section_id", e.target.value)}
                    className={`${formInputClass} appearance-none`}
                    required
                  >
                    <option value="">{t("pricing.form.selectSection")}</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    {t("pricing.form.serviceNameRequired")}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder={t("pricing.form.serviceNamePlaceholder")}
                    className={formInputClass}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    {t("pricing.form.description")}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder={t("pricing.form.descriptionPlaceholder")}
                    className={`${formInputClass} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      {t("pricing.form.priceRequired")}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="0.00"
                        className={`${formInputClass} pr-12`}
                        required
                      />
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <RiyalIcon size={18} className="text-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">
                      {t("pricing.form.duration")}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => handleInputChange("duration_minutes", parseInt(e.target.value, 10))}
                      className={formInputClass}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-600">
                      {t("pricing.form.features")}
                    </label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-sm font-semibold text-[#E39B34] transition hover:text-[#B8751A]"
                    >
                      {t("pricing.form.addFeature")}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={feature.is_checked}
                          onChange={(e) => handleFeatureChange(index, "is_checked", e.target.checked)}
                          className="rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
                        />
                        <input
                          type="text"
                          value={feature.name}
                          onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                          placeholder={t("pricing.form.featurePlaceholder")}
                          className={`${formInputClass} flex-1`}
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="rounded-full p-2 text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-600">
                      {t("homeServices.slotsTitle", "Available hours")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {t("pricing.form.duration", "Duration (minutes)")}
                    </p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <input
                      type="time"
                      value={slotForm.slot_time}
                      onChange={(e) => handleSlotInputChange("slot_time", e.target.value)}
                      className={formInputClass}
                      placeholder={t("homeServices.slotsTime", "Slot time")}
                    />
                    <input
                      type="number"
                      min="1"
                      value={slotForm.duration_minutes}
                      onChange={(e) => handleSlotInputChange("duration_minutes", e.target.value)}
                      className={formInputClass}
                      placeholder={t("homeServices.slotsDuration", "Duration")}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={slotForm.is_active}
                        onChange={(e) => handleSlotInputChange("is_active", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
                      />
                      {t("homeServices.slotsActive", "Active")}
                    </label>
                    <button
                      type="button"
                      onClick={handleAddSlot}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#E39B34] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#cf8629]"
                    >
                      {t("homeServices.slotsAdd", "Add slot")}
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {sortedSlots.length > 0 ? (
                      sortedSlots.map((slot) => (
                        <div
                          key={slot.id || slot.slot_time}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-900">{slot.slot_time}</p>
                            <p className="text-xs text-slate-500">
                              {slot.duration_minutes} {t("pricing.table.min")}
                              {" · "}
                              {slot.is_active
                                ? t("homeServices.slotsActive", "Active")
                                : t("homeServices.slotsInactive", "Inactive")}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSlot(slot.id || slot.slot_time)}
                            className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                          >
                            {t("common.delete", "Delete")}
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">
                        {t("homeServices.slotsHelp", "Define store hours that apply to service bookings.")}
                      </p>
                    )}
                  </div>
                  {slotsError && <p className="mt-2 text-xs text-rose-600">{slotsError}</p>}
                </div>
              </div>
              <div className="border-t border-white/60 px-6 py-5 flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t("pricing.actions.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={creatingService || updatingService}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E39B34] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingService || updatingService ? (
                    <>
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {editingService ? t("pricing.modal.updating") : t("pricing.modal.creating")}
                    </>
                  ) : (
                    editingService ? t("pricing.modal.updateService") : t("pricing.modal.createService")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="space-y-6">
        {Object.keys(servicesBySection).length === 0 ? (
          <div className="rounded-3xl border border-white/70 bg-white/85 p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m8-8V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1M9 7h6" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-900">{t("pricing.table.noServices")}</h4>
            <p className="mt-2 text-sm text-slate-500">
              {selectedSection === "all" ? t("pricing.table.noServicesDesc") : t("pricing.table.noServicesInSection")}
            </p>
          </div>
        ) : (
          Object.entries(servicesBySection).map(([sectionId, { section, services: sectionServices }]) => (
            <div key={sectionId} className="rounded-3xl border border-white/70 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur">
              <div className="border-b border-white/60 px-6 py-4">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-900">
                  <span className="text-xl">{section?.icon_key === "scissors" ? "✂" : "⭐"}</span>
                  {section?.name || t("pricing.table.unknownSection")}
                </h3>
                {section?.subtitle && <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>}
              </div>
              <div className="divide-y divide-white/60">
                {sectionServices.map((service) => (
                  <div key={service.id} className="p-6 hover:bg-white/80 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-slate-900">{service.name}</h4>
                        {service.description && (
                          <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                        )}
                        {service.service_features && service.service_features.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {service.service_features.map((feature, index) => (
                              <div
                                key={index}
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                  feature.is_checked
                                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : "border border-slate-200 bg-slate-50 text-slate-600"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    feature.is_checked ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                                />
                                {feature.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`text-right ${i18n.dir() === "rtl" ? "text-left" : "text-right"}`}>
                        <div className="inline-flex items-center gap-1 text-2xl font-bold text-[#E39B34]">
                          <RiyalIcon size={20} />
                          {parseFloat(service.price).toFixed(2)}
                        </div>
                        {service.duration_minutes && (
                          <div className="text-sm text-slate-500">
                            {service.duration_minutes} {t("pricing.table.min")}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditService(service)}
                        disabled={updatingService === service.id}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t("pricing.actions.edit")}
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        disabled={deletingService === service.id}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {deletingService === service.id ? t("pricing.errors.deleting") : t("pricing.actions.delete")}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
