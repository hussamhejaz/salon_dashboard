import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DashboardHeroHeader from "../../components/dashboard/DashboardHeroHeader";
import { formInputClass } from "../../utils/uiClasses";
import { useOwnerWorkingHours } from "../../hooks/owner/useWorkingHours";
import { API_BASE } from "../../config/api";

const DAYS = [
  { id: 0, label: "الحد" },
  { id: 1, label: "الإثن" },
  { id: 2, label: "الثلث" },
  { id: 3, label: "الأرب" },
  { id: 4, label: "الخمي" },
  { id: 5, label: "الجم" },
  { id: 6, label: "السبت" },
];

const initialSlotInput = {
  slot_time: "",
  duration_minutes: 30,
  is_active: true,
};

const AvailabilityManager = () => {
  const { t } = useTranslation();
  const {
    workingHours,
    loading: hoursLoading,
    updateWorkingHours,
    refetch,
  } = useOwnerWorkingHours();
  const [activeDay, setActiveDay] = useState(0);
  const [slotsByDay, setSlotsByDay] = useState({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotInput, setSlotInput] = useState(initialSlotInput);
  const [savingHours, setSavingHours] = useState(false);
  const [dayForm, setDayForm] = useState({});

  const activeWorkingDay = useMemo(
    () => workingHours.find((day) => day.day_of_week === activeDay) || {},
    [workingHours, activeDay]
  );

  useEffect(() => {
    setDayForm({ ...activeWorkingDay });
  }, [activeWorkingDay]);

  useEffect(() => {
    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError("");
      try {
        const token = localStorage.getItem("auth_token");
        const res = await fetch(`${API_BASE}/api/owner/time-slots`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setSlotsByDay(data.slots || {});
        } else {
          throw new Error(data.error || "FETCH_TIME_SLOTS_FAILED");
        }
      } catch (err) {
        setSlotsError(err.message);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, []);

  useEffect(() => {
    if (workingHours.length) {
      setActiveDay((prev) => (workingHours.some((day) => day.day_of_week === prev) ? prev : workingHours[0]?.day_of_week || 0));
    }
  }, [workingHours]);

  const handleSlotInputChange = (field, value) => {
    setSlotInput((prev) => ({ ...prev, [field]: value }));
  };

  const daySlots = slotsByDay[activeDay] || [];

  const handleAddSlot = async () => {
    if (!slotInput.slot_time) return;
    if (daySlots.some((slot) => slot.slot_time === slotInput.slot_time)) {
      setSlotsError(t("availability.errors.duplicateTime", "This slot already exists"));
      return;
    }
    const combined = [...daySlots, slotInput];
    await saveSlotsForDay(activeDay, combined);
    setSlotInput(initialSlotInput);
  };

  const saveSlotsForDay = async (day, newSlots) => {
    try {
      setSlotsLoading(true);
      setSlotsError("");
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/owner/time-slots`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          day_of_week: day,
          slots: newSlots,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSlotsByDay((prev) => ({ ...prev, [day]: data.slots || [] }));
      } else {
        throw new Error(data.error || "UPSERT_FAILED");
      }
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      setSlotsLoading(true);
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/api/owner/time-slots/${slotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setSlotsByDay((prev) => ({
          ...prev,
          [activeDay]: (prev[activeDay] || []).filter((slot) => slot.id !== slotId),
        }));
      } else {
        throw new Error(data.error || "DELETE_FAILED");
      }
    } catch (err) {
      setSlotsError(err.message);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleHoursChange = (field, value) => {
    setDayForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveHours = async () => {
    if (!workingHours.length) return;
    const updatedHours = workingHours.map((day) =>
      day.day_of_week === activeDay ? { ...day, ...dayForm } : day
    );
    setSavingHours(true);
    await updateWorkingHours(updatedHours);
    setSavingHours(false);
    refetch();
  };

  return (
    <section className="space-y-8 bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-6xl space-y-8">
        <DashboardHeroHeader
          tagLabel={t("availability.tag", "Available slots")}
          title={t("availability.title", "Live availability")}
          description={t("availability.subtitle", "Control hours & manual slots in one place")}
          highlights={[
            {
              label: t("availability.stats.count", "Available slots"),
              value: daySlots.length,
              hint: t("availability.stats.countHint", "Time picks for the selected day"),
            },
            {
              label: t("availability.stats.strategy", "Slot source"),
              value: t(`bookings.slotStrategy.${slotsLoading ? "loadingSlots" : "working_hours"}`, "Standard working hours"),
              hint: t("availability.stats.strategySub", "Manual entries or default schedule"),
            },
          ]}
        />

        <div className="rounded-3xl border border-white/60 bg-white/85 shadow-xl shadow-slate-900/5">
          <div className="px-6 py-5 border-b border-white/60">
            <h2 className="text-lg font-semibold text-slate-900">
              {t("availability.managerTitle", "Manage weekly availability")}
            </h2>
            <p className="text-sm text-slate-500">
              {t("availability.managerSubtitle", "Update hours once for all days and manage manual slots per weekday")}
            </p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setActiveDay(day.id)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    activeDay === day.id
                      ? "border-[#E39B34] bg-[#ffeedd] text-[#B66F1A]"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {t("availability.hours.title", "Working hours")}
                </h3>
                {hoursLoading ? (
                  <p className="text-sm text-slate-500">{t("availability.loadingHours", "Loading schedule...")}</p>
                ) : (
                  <div className="grid gap-3">
                    {["open_time", "close_time", "break_start", "break_end", "slot_interval"].map((field) => (
                      <div key={field}>
                        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                          {t(`availability.hours.${field}`, field.replace(/_/g, " "))}
                        </label>
                        <input
                          type={field.includes("time") ? "time" : "number"}
                          min={field === "slot_interval" ? 1 : undefined}
                          value={dayForm[field] || ""}
                          disabled={!activeWorkingDay.day_of_week && activeWorkingDay.day_of_week !== 0}
                          onChange={(e) => handleHoursChange(field, e.target.value)}
                          className={formInputClass}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleSaveHours}
                      disabled={savingHours}
                      className="w-full rounded-2xl bg-[#E39B34] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629] disabled:opacity-60"
                    >
                      {savingHours ? t("availability.savingHours", "Saving...") : t("availability.saveHours", "Save working hours")}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {t("availability.slots.title", "Manual slots")}
                </h3>
                <div className="space-y-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <input
                      type="time"
                      value={slotInput.slot_time}
                      onChange={(e) => handleSlotInputChange("slot_time", e.target.value)}
                      className={formInputClass}
                      placeholder="00:00"
                    />
                    <input
                      type="number"
                      min="1"
                      value={slotInput.duration_minutes}
                      onChange={(e) => handleSlotInputChange("duration_minutes", e.target.value)}
                      className={formInputClass}
                      placeholder={t("availability.slots.durationPlaceholder", "Duration")}
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={slotInput.is_active}
                        onChange={(e) => handleSlotInputChange("is_active", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#E39B34] focus:ring-[#E39B34]"
                      />
                      {t("availability.slots.active", "Active")}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSlot}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#E39B34] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
                  >
                    {t("availability.slots.add", "Add slot")}
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  {slotsLoading && (
                    <p className="text-sm text-slate-500">{t("availability.slots.loading", "Updating slots...")}</p>
                  )}
                  {slotsError && (
                    <p className="text-sm text-rose-600">{slotsError}</p>
                  )}
                  <div className="grid grid-cols-1 gap-2">
                    {daySlots.map((slot) => (
                      <div key={slot.id || slot.slot_time} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{slot.slot_time}</p>
                          <p className="text-xs text-slate-500">
                            {t("availability.slots.duration", "Duration")}: {slot.duration_minutes} {t("bookings.minutes", "min")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold ${slot.is_active ? "text-green-600" : "text-rose-600"}`}>
                            {slot.is_active ? t("availability.slots.activeLabel", "Active") : t("availability.slots.inactiveLabel", "Inactive")}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="text-sm text-rose-600 hover:text-rose-800"
                          >
                            {t("bookings.delete", "Delete")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvailabilityManager;
