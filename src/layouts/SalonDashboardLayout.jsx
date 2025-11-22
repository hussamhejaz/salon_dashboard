// src/layouts/SalonDashboardLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/owner/Sidebar";

const SUPPORT_WHATSAPP = "https://wa.me/9665XXXXXXXXX?text=%D8%A3%D8%A8%D9%8A%20%D8%AD%D8%AC%D8%B2";

export default function SalonDashboardLayout() {
  const { t } = useTranslation();

  return (
    <div className="h-screen flex bg-slate-100 text-slate-900 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur px-5 py-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-lg font-semibold text-[#B8751A]">
                {t("dashboard.headerTag", "Control Center")}
              </p>
            </div>

            <div className="flex items-center gap-2">
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
