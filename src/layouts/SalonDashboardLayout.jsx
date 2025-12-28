// src/layouts/SalonDashboardLayout.jsx
import React, { useMemo, useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/owner/Sidebar";
import { useOwnerNotifications } from "../hooks/owner/useOwnerNotifications";

const SUPPORT_PHONE = "+966567883842";
const SUPPORT_MESSAGE = encodeURIComponent("TrendWa Tech - I need help");
const SUPPORT_WHATSAPP = `https://wa.me/966567883842?text=${SUPPORT_MESSAGE}`;

export default function SalonDashboardLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { notifications, loading, markAsRead, refetch } = useOwnerNotifications({
    initialLimit: 10,
    autoRefresh: true,
    refreshInterval: 15000,
  });

  const unreadCount = useMemo(
    () => (notifications || []).filter((n) => n.status === "unread").length,
    [notifications]
  );

  const recentNotifications = useMemo(() => (notifications || []).slice(0, 5), [notifications]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleNotificationClick = (notification) => {
    setOpen(false);
    if (notification.status === "unread") {
      markAsRead(notification.id);
    }
    if (notification.booking_id) {
      navigate(`/dashboard/booking?bookingId=${notification.booking_id}`);
    } else if (notification.home_booking_id) {
      navigate(`/dashboard/home-service-bookings?homeBookingId=${notification.home_booking_id}`);
    } else {
      navigate(`/dashboard/notifications`);
    }
  };

  return (
    <div className="h-screen flex bg-slate-100 text-slate-900">
      <Sidebar />

      <main className="relative flex-1 flex flex-col min-w-0">
        <header className="relative z-30 flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur px-5 py-4 shadow-sm overflow-visible">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[#B8751A]">
                {t("dashboard.headerTag", "Control Center")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setOpen((p) => !p)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-[#E39B34] hover:text-[#E39B34]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {open && (
                  <div
                    className={`absolute ${document.dir === 'rtl' ? 'left-0' : 'right-0'} z-[80] mt-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {t("notifications.title", "Notifications")}
                      </p>
                      <button
                        onClick={() => navigate('/dashboard/notifications')}
                        className="text-xs font-semibold text-[#E39B34] hover:underline"
                      >
                        {t("common.viewAll", "View all")}
                      </button>
                      <button
                        onClick={() => refetch({ page: 1 })}
                        className="text-xs font-semibold text-slate-500 hover:text-[#E39B34]"
                      >
                        {t('common.refresh', 'Refresh')}
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loading ? (
                        <div className="px-4 py-3 text-sm text-slate-500">{t('common.loading', 'Loading...')}</div>
                      ) : recentNotifications.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500">
                          {t("notifications.empty", "No notifications found")}
                        </div>
                      ) : (
                        recentNotifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{n.title || t('notifications.title', 'Notifications')}</p>
                              <span
                                className={`inline-flex h-2 w-2 rounded-full ${
                                  n.status === 'unread' ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-600 line-clamp-2">{n.message || ''}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <a
                href={SUPPORT_WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#E39B34] to-[#B8751A] px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 transition"
              >
                {t("dashboard.headerSupport", "Support")}
              </a>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow md:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
