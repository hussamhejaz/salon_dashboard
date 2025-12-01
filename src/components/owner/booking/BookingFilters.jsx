// src/components/owner/booking/BookingFilters.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const BookingFilters = ({ filters, onUpdateFilters, onClearFilters }) => {
  const { t } = useTranslation();
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const statusOptions = [
    { value: '', label: t('bookings.status.all', 'All Status') },
    { value: 'pending', label: t('bookings.status.pending', 'Pending') },
    { value: 'confirmed', label: t('bookings.status.confirmed', 'Confirmed') },
    { value: 'completed', label: t('bookings.status.completed', 'Completed') },
    { value: 'cancelled', label: t('bookings.status.cancelled', 'Cancelled') },
    { value: 'no_show', label: t('bookings.status.noShow', 'No Show') },
  ];

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onUpdateFilters({ search: searchTerm });
      }
    }, 500);
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
    filters.status ||
    filters.date ||
    filters.start_date ||
    filters.end_date ||
    filters.search ||
    filters.include_archived ||
    filters.archived_only;

  const toggleIncludeArchived = () => {
    const next = !filters.include_archived;
    onUpdateFilters({
      include_archived: next,
      archived_only: next ? filters.archived_only : false,
    });
  };

  const toggleArchivedOnly = () => {
    const next = !filters.archived_only;
    onUpdateFilters({
      archived_only: next,
      include_archived: next ? true : filters.include_archived,
    });
  };

  return (
    <div className="rounded-3xl border-b border-white/60 bg-white/90 px-6 py-5 backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t('bookings.searchPlaceholder', 'Search by customer name or phone...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 pl-10 pr-4 text-sm text-slate-700 shadow-inner shadow-slate-900/5 transition focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="appearance-none rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 pr-10 text-sm font-semibold text-slate-700 shadow-inner shadow-slate-900/5 transition focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 shadow-inner">
            <button
              type="button"
              onClick={toggleIncludeArchived}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filters.include_archived
                  ? 'bg-[#E39B34] text-white shadow-sm shadow-[#E39B34]/30'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t('bookings.filters.includeArchived', 'Show archived')}
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={toggleArchivedOnly}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filters.archived_only
                  ? 'bg-[#E39B34] text-white shadow-sm shadow-[#E39B34]/30'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {t('bookings.filters.archivedOnly', 'Archived only')}
            </button>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
              showFilters ? 'border-[#E39B34] bg-[#FEF6E8] text-[#E39B34]' : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{t('common.filters', 'Filters')}</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {t('common.clear', 'Clear')}
            </button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 md:grid-cols-3">
          {[
            { key: 'date', label: t('bookings.filters.date', 'Specific Date'), value: filters.date },
            { key: 'start_date', label: t('bookings.filters.startDate', 'From Date'), value: filters.start_date },
            { key: 'end_date', label: t('bookings.filters.endDate', 'To Date'), value: filters.end_date },
          ].map(({ key, label, value }) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-semibold text-slate-600">{label}</label>
              <input
                type="date"
                value={value || ''}
                onChange={(e) => handleFilterChange(key, e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 shadow-inner shadow-slate-900/5 transition focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
              />
            </div>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.status && (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
              {t('bookings.status.' + filters.status)}
              <button onClick={() => handleFilterChange('status', '')} className="ml-1.5 rounded-full p-0.5 hover:bg-blue-100">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.date && (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
              Date: {filters.date}
              <button onClick={() => handleFilterChange('date', '')} className="ml-1.5 rounded-full p-0.5 hover:bg-green-100">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.start_date && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
              From: {filters.start_date}
              <button onClick={() => handleFilterChange('start_date', '')} className="ml-1.5 rounded-full p-0.5 hover:bg-amber-100">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.end_date && (
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800">
              To: {filters.end_date}
              <button onClick={() => handleFilterChange('end_date', '')} className="ml-1.5 rounded-full p-0.5 hover:bg-purple-100">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
              Search: {filters.search}
              <button
                onClick={() => {
                  handleFilterChange('search', '');
                  setSearchTerm('');
                }}
                className="ml-1.5 rounded-full p-0.5 hover:bg-slate-100"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.include_archived && !filters.archived_only && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800">
              {t('bookings.filters.includeArchived', 'Show archived')}
              <button onClick={toggleIncludeArchived} className="ml-1.5 rounded-full p-0.5 hover:bg-slate-200">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {filters.archived_only && (
            <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-900">
              {t('bookings.filters.archivedOnly', 'Archived only')}
              <button onClick={toggleArchivedOnly} className="ml-1.5 rounded-full p-0.5 hover:bg-slate-300">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingFilters;
