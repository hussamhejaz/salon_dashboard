import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../config/api";
import DashboardHeroHeader from "../../components/dashboard/DashboardHeroHeader";
import { formInputClass } from "../../utils/uiClasses";

const initialSlot = {
  slot_time: "",
  duration_minutes: 30,
  is_active: true,
};

export default function ServiceAvailabilityPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotForm, setSlotForm] = useState(initialSlot);
  const [savingSlots, setSavingSlots] = useState(false);

  const heroHighlights = useMemo(() => {
    const activeSlots = slots.filter((slot) => slot.is_active).length;
    const durationHint = services.find((svc) => svc.id === selectedService)?.duration_minutes || 30;
    return [
      {
        label: t("availability.stats.count", "Available slots"),
        value: slots.length,
        hint: t("availability.stats.countHint", "Visible time options"),
      },
      {
        label: t("availability.stats.active", "Active slots"),
        value: activeSlots,
        hint: t("availability.stats.activeHint", "Slots shown to clients"),
      },
      {
        label: t("availability.stats.duration", "Service duration"),
        value: `${durationHint} ${t("bookings.minutes", "min")}`,
        hint: t("availability.stats.durationHint", "Default duration"),
      },
    ];
  }, [slots, selectedService, services, t]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE}/api/owner/services`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setServices(data.services || []);
          if (!selectedService && data.services?.length) {
            setSelectedService(data.services[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load services", err);
      }
    };

    fetchServices();
  }, [selectedService]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedService) {
        setSlots([]);
        return;
      }
      setSlotsLoading(true);
      setSlotsError("");
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE}/api/owner/services/${selectedService}/slots`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setSlots(data.slots || []);
        } else {
          throw new Error(data.error || "Failed to load slots");
        }
      } catch (err) {
        setSlots([]);
        setSlotsError(err.message);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedService]);

  const handleSlotChange = (field, value) => {
    setSlotForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSlot = async () => {
    if (!slotForm.slot_time) return;
    setSavingSlots(true);
    setSlotsError("");
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/owner/services/${selectedService}/slots`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slots: [...slots, slotForm] }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSlots(data.slots || []);
        setSlotForm(initialSlot);
      } else {
        throw new Error(data.error || "Failed to save slots");
      }
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setSavingSlots(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    setSlotsLoading(true);
    setSlotsError("");
    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/owner/services/${selectedService}/slots/${slotId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
      } else {
        throw new Error(data.error || "Failed to delete slot");
      }
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  };

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t("services.tag", "Services")}
          title={t("availability.title", "Live availability")}
          description={t("availability.subtitle", "Define per-service hours for bookings")}
          highlights={heroHighlights}
        />

        <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">
                {t("services.serviceSelect", "Service")}
              </label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className={`${formInputClass} appearance-none`}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">
                {t("availability.slots.duration", "Duration")}
              </label>
              <input
                type="number"
                min="1"
                value={slotForm.duration_minutes}
                onChange={(e) => handleSlotChange("duration_minutes", e.target.value)}
                className={formInputClass}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAddSlot}
                disabled={savingSlots}
                className="inline-flex items-center justify-center w-full rounded-2xl bg-[#E39B34] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629] disabled:opacity-60"
              >
                {savingSlots ? t("availability.slots.loading", "Updating slots...") : t("availability.slots.add", "Add slot")}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input
              type="time"
              value={slotForm.slot_time}
              onChange={(e) => handleSlotChange("slot_time", e.target.value)}
              className={formInputClass}
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={slotForm.is_active}
                onChange={(e) => handleSlotChange("is_active", e.target.checked)}
                className="h-4 w-4 rounded border border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
              />
              {t("availability.slots.active", "Active")}
            </label>
          </div>
          {slotsError && <p className="text-sm text-rose-600">{slotsError}</p>}
          {slotsLoading ? (
            <p className="text-sm text-slate-500">{t("availability.slots.loading", "Updating slots...")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {slots.map((slot) => (
                <div
                  key={slot.id || slot.slot_time}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-900">{slot.slot_time}</p>
                    <p className="text-xs text-slate-500">
                      {t("availability.slots.duration", "Duration")}: {slot.duration_minutes} {t("bookings.minutes", "min")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${slot.is_active ? "text-emerald-600" : "text-rose-600"}`}>
                      {slot.is_active ? t("availability.slots.activeLabel", "Active") : t("availability.slots.inactiveLabel", "Inactive")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      {t("bookings.delete", "Delete")}
                    </button>
                  </div>
                </div>
              ))}
              {!slots.length && (
                <p className="text-sm text-slate-500">{t("availability.empty", "No slots configured yet.")}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
