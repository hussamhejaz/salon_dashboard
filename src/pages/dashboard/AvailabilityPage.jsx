import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../config/api";
import DashboardHeroHeader from "../../components/dashboard/DashboardHeroHeader";
import { formInputClass } from "../../utils/uiClasses";

function AvailabilityPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotStrategy, setSlotStrategy] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  const heroHighlights = useMemo(() => {
    return [
      {
        label: t("availability.stats.count", "Available slots"),
        value: slots.length,
        hint: t("availability.stats.countHint", "Visible time options"),
      },
      {
        label: t("availability.stats.service", "Selected service"),
        value: services.find((svc) => svc.id === selectedService)?.name || t("availability.stats.serviceHint", "Pick a service"),
        hint: t("availability.stats.serviceSub", "Duration & price set below"),
      },
      {
        label: t("availability.stats.strategy", "Slot source"),
        value: slotStrategy ? t(`bookings.slotStrategy.${slotStrategy}`, slotStrategy) : t("availability.stats.strategyHint", "Live availability"),
        hint: t("availability.stats.strategySub", "Manual or working hours"),
      },
    ];
  }, [slots.length, selectedService, slotStrategy, services, t]);

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
        } else {
          console.error("Failed to load services", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch services", err);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedService || !date) {
        setSlots([]);
        setSlotStrategy("");
        setSlotsError("");
        return;
      }

      setSlotsLoading(true);
      setSlotsError("");

      try {
        const token = localStorage.getItem("auth_token");
        const duration = services.find((svc) => svc.id === selectedService)?.duration_minutes || 30;
        const params = new URLSearchParams({
          date,
          service_id: selectedService,
          duration_minutes: `${duration}`,
          type: "salon",
        });
        const res = await fetch(`${API_BASE}/api/owner/availability/slots?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.ok && data.ok) {
          setSlots(data.available_slots || []);
          setSlotStrategy(data.slot_strategy || "working_hours");
        } else {
          setSlots([]);
          setSlotStrategy("");
          setSlotsError(data.error || t("availability.errors.fetchSlots", "Failed to load available slots."));
        }
      } catch (err) {
        setSlots([]);
        setSlotStrategy("");
        setSlotsError(err.message || t("availability.errors.fetchSlots", "Failed to load available slots."));
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [date, selectedService, services, t]);

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t("availability.tag", "Available Slots")}
          title={t("availability.title", "Live availability")}
          description={t("availability.subtitle", "Pick the perfect time your clients can book")}
          highlights={heroHighlights}
        />

        <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">{t("availability.field.service", "Service")}</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className={`${formInputClass} appearance-none`}
              >
                <option value="">{t("availability.field.selectService", "Select a service")}</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 mb-1 block">{t("availability.field.date", "Date")}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`${formInputClass}`}
              />
            </div>
            <div className="flex items-end justify-end text-sm">
              <p className="text-slate-500">
                {t("availability.helper", "Slots refresh automatically when you change the date or service")}
              </p>
            </div>
          </div>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative inline-flex h-12 w-12 items-center justify-center">
                <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
                  {t("common.loadingShort", "LO")}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {slotsError && (
                <p className="text-sm text-rose-600">{slotsError}</p>
              )}
              {!slotsError && !slots.length && (
                <p className="text-sm text-slate-500">
                  {t("availability.empty", "No slots available right now. Change the date or service and try again.")}
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:border-[#E39B34] hover:text-[#E39B34] transition"
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AvailabilityPage;
