import React from "react";

export default function DashboardHeroHeader({ tagLabel, title, description, highlights = [], actions }) {
  return (
    <div className="rounded-3xl border border-white/60 bg-gradient-to-br from-[#fef3e6] via-white to-[#f3f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {tagLabel}
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>

        {actions && (
          <div className="flex flex-shrink-0 items-center gap-3">{actions}</div>
        )}
      </div>

      {highlights.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.hint}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
