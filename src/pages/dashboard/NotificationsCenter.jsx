import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useOwnerNotifications from '../../hooks/owner/useOwnerNotifications';

const formatDate = (value, locale) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const NotificationsCenter = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language?.startsWith('ar');
  const locale = isRTL ? 'ar-SA' : 'en-US';

  const [searchTerm, setSearchTerm] = useState('');

  const {
    notifications,
    pagination,
    filters,
    loading,
    error,
    setPage,
    setLimit,
    refetch,
    setFilters,
  } = useOwnerNotifications();

  useEffect(() => {
    const id = setTimeout(() => {
      refetch({ page: 1, search: searchTerm });
    }, 400);
    return () => clearTimeout(id);
  }, [searchTerm, refetch]);

  const tableRows = useMemo(
    () =>
      notifications.map((item) => (
        <tr
          key={item.id}
          className="cursor-pointer border-b border-slate-100 last:border-b-0 transition hover:bg-slate-50/70"
          onClick={() => {
            if (item.booking_id) {
              navigate(`/dashboard/booking?bookingId=${item.booking_id}`);
            } else if (item.home_booking_id) {
              navigate(`/dashboard/home-service-bookings?homeBookingId=${item.home_booking_id}`);
            }
          }}
        >
          <td className="px-3 py-3 text-sm font-semibold text-slate-900">{item.title || '—'}</td>
          <td className="px-3 py-3 text-sm text-slate-700">{item.message || '—'}</td>
          <td className="px-3 py-3 text-sm text-slate-600">{formatDate(item.created_at, locale)}</td>
          <td className="px-3 py-3 text-sm">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                item.status === 'unread'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {item.status === 'unread'
                ? t('notifications.status.unread', 'Unread')
                : t('notifications.status.read', 'Read')}
            </span>
          </td>
        </tr>
      )),
    [notifications, locale, t, navigate]
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8741a]">
                {t('notifications.title', 'Notifications')}
              </div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {t('notifications.subtitle', 'Updates from your bookings and home visits')}
              </h1>
              <p className="text-sm text-slate-600">
                {t('notifications.helper', 'See recent alerts, booking changes, and updates in one place.')}
              </p>
            </div>
            <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('notifications.search', 'Search title/message')}
                  className="w-64 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 pr-10 text-sm text-slate-700 shadow-inner focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
                />
                <svg
                  className="absolute inset-y-0 right-3 my-auto h-4 w-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  refetch({ page: 1, status: e.target.value });
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-inner"
              >
                <option value="">{t('notifications.status.all', 'All')}</option>
                <option value="unread">{t('notifications.status.unread', 'Unread')}</option>
                <option value="read">{t('notifications.status.read', 'Read')}</option>
              </select>
              <select
                value={pagination.limit}
                onChange={(e) => {
                  const next = Number(e.target.value || 20);
                  setLimit(next);
                  setPage(1);
                  refetch({ page: 1, limit: next });
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-inner"
              >
                {[10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} / {t('common.page', 'page')}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={filters.since || ''}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, since: e.target.value }));
                  refetch({ page: 1, since: e.target.value });
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/20"
              />
              <button
                onClick={() => refetch({ page: 1, status: filters.status, since: filters.since })}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#E39B34] hover:text-[#E39B34]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8 8 0 104.582 9" />
                </svg>
                {t('common.refresh', 'Refresh')}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 md:p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-semibold">{t('notifications.columns.title', 'Title')}</th>
                  <th className="px-3 py-2 font-semibold">{t('notifications.columns.message', 'Message')}</th>
                  <th className="px-3 py-2 font-semibold">{t('notifications.columns.createdAt', 'Created')}</th>
                  <th className="px-3 py-2 font-semibold">{t('notifications.columns.status', 'Status')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-100 last:border-b-0">
                      {Array.from({ length: 4 }).map((__, col) => (
                        <td key={col} className="px-3 py-3">
                          <div className="h-3 w-full rounded-full bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-500">
                      {t('notifications.empty', 'No notifications found')}
                    </td>
                  </tr>
                ) : (
                  tableRows
                )}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
              <div>
                <span className="font-semibold text-slate-900">{pagination.total}</span>{' '}
                {t('dashboard.clients.total', 'Total clients')}
              </div>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => {
                    if (pagination.page > 1) {
                      const next = pagination.page - 1;
                      setPage(next);
                      refetch({ page: next });
                    }
                  }}
                  disabled={pagination.page <= 1}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                >
                  {t('bookings.pagination.previous', 'Previous')}
                </button>
                <span className="text-xs font-semibold text-slate-500">
                  {pagination.page} / {pagination.pages}
                </span>
                <button
                  onClick={() => {
                    if (pagination.page < pagination.pages) {
                      const next = pagination.page + 1;
                      setPage(next);
                      refetch({ page: next });
                    }
                  }}
                  disabled={pagination.page >= pagination.pages}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
                >
                  {t('bookings.pagination.next', 'Next')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsCenter;
