// src/pages/owner/home-service-bookings/components/HomeServiceFilters.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const HomeServiceFilters = ({ filters, onUpdateFilters, onClearFilters }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const statusOptions = [
    { value: '', label: t('bookings.status.all', 'All Status') },
    { value: 'pending', label: t('bookings.status.pending', 'Pending') },
    { value: 'confirmed', label: t('bookings.status.confirmed', 'Confirmed') },
    { value: 'completed', label: t('bookings.status.completed', 'Completed') },
    { value: 'cancelled', label: t('bookings.status.cancelled', 'Cancelled') },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onUpdateFilters({ search: searchTerm });
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters.search, onUpdateFilters]);

  const handleFilterChange = (key, value) => {
    onUpdateFilters({ [key]: value });
  };

  const handleClearFilters = () => {
    onClearFilters();
    setSearchTerm('');
    setShowFilters(false);
  };

  const hasActiveFilters =
    filters.status || filters.area || filters.date || filters.start_date || filters.end_date || filters.search;

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/15';

  return (
    <div className="border-b border-white/40 px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('homeServiceBookings.searchPlaceholder', 'Search by customer name, phone, or area...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={`${inputClass} pr-10 appearance-none`}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <input
            type="text"
            placeholder={t('homeServiceBookings.areaFilter', 'Area')}
            value={filters.area || ''}
            onChange={(e) => handleFilterChange('area', e.target.value)}
            className={`${inputClass} w-32`}
          />

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
              showFilters
                ? 'border-[#E39B34] bg-[#FEF6E8] text-[#E39B34]'
                : 'border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('common.filters', 'Filters')}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('common.clear', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mt-5 grid grid-cols-1 gap-4 border-t border-white/40 pt-4 md:grid-cols-3">
          {[
            { key: 'date', label: t('bookings.filters.date', 'Specific Date') },
            { key: 'start_date', label: t('bookings.filters.startDate', 'From Date') },
            { key: 'end_date', label: t('bookings.filters.endDate', 'To Date') },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-semibold text-slate-600">{label}</label>
              <input
                type="date"
                value={filters[key] || ''}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'status', label: filters.status ? t(`bookings.status.${filters.status}`) : '' },
            { key: 'area', label: filters.area ? `${t('homeServiceBookings.area', 'Area')}: ${filters.area}` : '' },
            { key: 'date', label: filters.date ? `${t('bookings.filters.date', 'Date')}: ${filters.date}` : '' },
            {
              key: 'start_date',
              label: filters.start_date ? `${t('bookings.filters.startDate', 'From')}: ${filters.start_date}` : '',
            },
            {
              key: 'end_date',
              label: filters.end_date ? `${t('bookings.filters.endDate', 'To')}: ${filters.end_date}` : '',
            },
          ]
            .filter((badge) => badge.label)
            .map(({ key, label }) => (
              <span
                key={key}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {label}
                <button
                  onClick={() => handleFilterChange(key, '')}
                  className="rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

export default HomeServiceFilters;
