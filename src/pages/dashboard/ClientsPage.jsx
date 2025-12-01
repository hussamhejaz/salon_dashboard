import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useOwnerClients from '../../hooks/owner/useOwnerClients';

// Format currency helper
const formatCurrency = (value, locale = 'en-US') =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(Number(value || 0));

const PaginationControls = ({ page, pages, total, onPrev, onNext, isRTL }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
      <div>
        <span className="font-semibold text-slate-900">{total}</span>{' '}
        {/* i18n key: dashboard.clients.total */}results
      </div>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
        >
          {/* i18n key: common.prev */}Prev
        </button>
        <span className="text-xs font-semibold text-slate-500">
          {page} / {pages}
        </span>
        <button
          onClick={onNext}
          disabled={page >= pages}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-slate-50"
        >
          {/* i18n key: common.next */}Next
        </button>
      </div>
    </div>
  );
};

const ClientsPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith('ar');
  const [searchTerm, setSearchTerm] = useState('');

  const { clients, pagination, loading, error, refetch, setPage, setLimit, setSearch } = useOwnerClients({
    initialPage: 1,
    initialLimit: 10,
    initialSearch: '',
  });

  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchTerm);
      setPage(1);
      refetch({ search: searchTerm, page: 1 });
    }, 400);
    return () => clearTimeout(id);
  }, [searchTerm, setSearch, refetch, setPage]);

  const locale = isRTL ? 'ar-SA' : 'en-US';

  const tableRows = useMemo(
    () =>
      clients.map((client, idx) => (
        <tr
          key={client.id || idx}
          className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition"
        >
          <td className="px-3 py-3 text-sm font-semibold text-slate-900">{client.name || '—'}</td>
          <td className="px-3 py-3 text-sm text-slate-700">{client.phone || '—'}</td>
          <td className="px-3 py-3 text-sm text-slate-700">{client.email || '—'}</td>
          <td className="px-3 py-3 text-sm font-semibold text-slate-900">{client.total_bookings ?? 0}</td>
          <td className="px-3 py-3 text-sm font-semibold text-slate-900">
            {formatCurrency(client.total_revenue, locale)}
          </td>
          <td className="px-3 py-3 text-sm text-slate-600">
            {client.last_booking_at || client.last_booking_date
              ? new Date(client.last_booking_at || client.last_booking_date).toLocaleDateString(locale, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : '—'}
          </td>
        </tr>
      )),
    [clients, locale]
  );

  const handleDownload = () => {
    const rows = clients.map((c) => ({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      total_bookings: c.total_bookings ?? 0,
      total_revenue: c.total_revenue ?? 0,
      last_booking_at: c.last_booking_at || c.last_booking_date || '',
    }));
    const header = ['name', 'phone', 'email', 'total_bookings', 'total_revenue', 'last_booking_at'];
    const csv = [header.join(',')]
      .concat(
        rows.map((r) =>
          header
            .map((key) => {
              const v = r[key];
              if (typeof v === 'string' && v.includes(',')) {
                return `"${v.replace(/"/g, '""')}"`;
              }
              return v;
            })
            .join(',')
        )
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-slate-200/60">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8741a]">
                {t('dashboard.clients.title', 'Clients')} {/* i18n key */}
              </div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {t('dashboard.clients.subtitle', 'Manage your customers and revenue impact')} {/* i18n key */}
              </h1>
              <p className="text-sm text-slate-600">
                {t('dashboard.clients.helper', 'Search, filter, and review client history quickly.')} {/* i18n key */}
              </p>
            </div>
            <div className={`flex flex-wrap items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('dashboard.clients.search', 'Search by name or phone')} // i18n key: dashboard.clients.search
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
                value={pagination.limit}
                onChange={(e) => {
                  const nextLimit = Number(e.target.value || 10);
                  setLimit(nextLimit);
                  setPage(1);
                  refetch({ page: 1, limit: nextLimit });
                }}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-inner"
              >
                {[10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} / {t('common.page', 'page')}
                  </option>
                ))}
              </select>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-[#E39B34] hover:text-[#E39B34]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
                {t('dashboard.clients.download', 'Download')}
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/95 p-4 md:p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.name', 'Client')}</th>
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.phone', 'Phone')}</th>
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.email', 'Email')}</th>
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.totalBookings', 'Total Bookings')}</th>
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.totalRevenue', 'Total Revenue')}</th>
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.lastBooking', 'Last Booking')}</th>
                  <th className="px-3 py-2 font-semibold">{t('dashboard.clients.columns.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse border-b border-slate-100 last:border-b-0">
                      {Array.from({ length: 7 }).map((__, col) => (
                        <td key={col} className="px-3 py-3">
                          <div className="h-3 w-full rounded-full bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-500">
                      {t('dashboard.clients.empty', 'No clients found')} {/* i18n key */}
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

          <PaginationControls
            page={pagination.page}
            pages={pagination.pages}
            total={pagination.total}
            isRTL={isRTL}
            onPrev={() => {
              if (pagination.page > 1) {
                const next = pagination.page - 1;
                setPage(next);
                refetch({ page: next });
              }
            }}
            onNext={() => {
              if (pagination.page < pagination.pages) {
                const next = pagination.page + 1;
                setPage(next);
                refetch({ page: next });
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ClientsPage;
