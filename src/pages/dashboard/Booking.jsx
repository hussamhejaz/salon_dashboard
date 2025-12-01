import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useBookingDashboard } from '../../hooks/owner/useBookingDashboard';
import BookingStats from '../../components/owner/booking/BookingStats';
import BookingFilters from '../../components/owner/booking/BookingFilters';
import BookingGrid from '../../components/owner/booking/BookingGrid';
import EditBookingModal from '../../components/owner/booking/EditBookingModal';
import BookingCalendar from '../../components/calendar/BookingCalendar';

const Booking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    bookings,
    stats,
    loading,
    filters,
    pagination,
    fetchBookings,
    updateBooking,
    deleteBooking,
    updateFilters,
    clearFilters,
    changePage,
    getTodaysBookings,
    getUpcomingBookings,
    // getBookingById,
    autoRefresh,
    setAutoRefresh,
  } = useBookingDashboard();

  const [editingBooking, setEditingBooking] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');

  const handleStatusUpdate = useCallback(
    async (bookingId, newStatus) => {
      const result = await updateBooking(bookingId, { status: newStatus });
      if (result?.success) {
        fetchBookings(pagination.page);
      }
      return result;
    },
    [updateBooking, fetchBookings, pagination.page]
  );

  const handleDeleteBooking = useCallback(
    async (bookingId) => {
      const result = await deleteBooking(bookingId);
      if (result?.success) {
        const isLastItemOnPage = bookings.length === 1 && pagination.page > 1;
        if (isLastItemOnPage) {
          changePage(pagination.page - 1);
        } else {
          fetchBookings(pagination.page);
        }
      }
      return result;
    },
    [deleteBooking, bookings.length, pagination.page, fetchBookings, changePage]
  );

  const handleArchive = useCallback(
    async (bookingId) => {
      // mark booking as archived; backend should handle the field name (archived) accordingly
      const result = await updateBooking(bookingId, { archived: true });
      if (result?.success) {
        fetchBookings(pagination.page);
      }
      return result;
    },
    [updateBooking, fetchBookings, pagination.page]
  );

  const handleUnarchive = useCallback(
    async (bookingId) => {
      const result = await updateBooking(bookingId, { archived: false });
      if (result?.success) {
        fetchBookings(pagination.page);
      }
      return result;
    },
    [updateBooking, fetchBookings, pagination.page]
  );

  const handleEditBooking = useCallback((booking) => {
    setEditingBooking(booking);
  }, []);

  const handleSaveEdit = useCallback(
    async (bookingId, updateData) => {
      const result = await updateBooking(bookingId, updateData);
      if (result?.success) {
        setEditingBooking(null);
        fetchBookings(pagination.page);
      }
      return result;
    },
    [updateBooking, fetchBookings, pagination.page]
  );

  const handleViewDetails = useCallback(
    (booking) => {
      if (!booking || !booking.id) return;
      navigate(`/dashboard/booking/${booking.id}`);
    },
    [navigate]
  );

  // Open booking detail when navigated with ?bookingId=
  useEffect(() => {
    const bookingId = searchParams.get('bookingId');
    if (bookingId) {
      navigate(`/dashboard/booking/${bookingId}`, { replace: true });
    }
  }, [searchParams, navigate]);

  const paginationWindow = useMemo(() => {
    const total = pagination.pages || 1;
    const current = pagination.page || 1;
    const size = 5;

    let start = Math.max(1, current - Math.floor(size / 2));
    let end = Math.min(total, start + size - 1);
    start = Math.max(1, end - size + 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [pagination.pages, pagination.page]);

  if (loading && bookings.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="relative inline-flex h-12 w-12 items-center justify-center">
            <span className="absolute h-full w-full animate-ping rounded-full bg-[#E39B34]/30" />
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#E39B34] text-[#E39B34] font-semibold">
              {t('common.loadingShort', 'LO')}
            </span>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            {t('bookings.list.loading', 'Loading bookings...')}
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('bookings.stats.today', "Today's Bookings"),
      value: getTodaysBookings().length,
      hint: t('bookings.stats.todayDesc', 'Scheduled for today'),
    },
    {
      label: t('bookings.stats.upcoming', 'Upcoming Bookings'),
      value: getUpcomingBookings().length,
      hint: t('bookings.stats.upcomingDesc', 'Next 7 days'),
    },
    {
      label: t('bookings.stats.total', 'Total Bookings'),
      value: stats.total_bookings || 0,
      hint: t('bookings.stats.totalDesc', 'All bookings'),
    },
    {
      label: t('bookings.stats.revenue', 'Revenue (SAR)'),
      value: stats.total_revenue || 0,
      hint: t('bookings.stats.revenueDesc', 'Total revenue generated'),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#FFF3E1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#b8741a]">
                {t('bookings.title', 'Booking Management')}
              </div>
              <h1 className="text-3xl font-semibold text-slate-900">
                {t('bookings.subtitle', 'Manage appointments and customer bookings')}
              </h1>
              <p className="text-sm text-slate-600">
                {t(
                  'bookings.heroDescription',
                  "Monitor today's schedule, upcoming visits, and revenue opportunities in one workspace."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                {[
                  { key: 'calendar', label: t('bookings.view.calendar', 'Calendar') },
                  { key: 'grid', label: t('common.grid', 'Grid') },
                  { key: 'list', label: t('common.list', 'List') },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key)}
                    className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      viewMode === mode.key
                        ? 'bg-[#E39B34] text-white shadow-sm shadow-[#E39B34]/30'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAutoRefresh((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                  autoRefresh
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${autoRefresh ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {autoRefresh ? t('bookings.live.on', 'Live update ON') : t('bookings.live.off', 'Live update OFF')}
              </button>

              <Link
                to="/dashboard/appointments/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('bookings.newBooking', 'New Booking')}
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500">{item.hint}</p>
              </div>
            ))}
          </div>
        </div>

        <BookingStats stats={stats} todaysBookings={getTodaysBookings()} upcomingBookings={getUpcomingBookings()} />

        <div className="rounded-3xl border border-slate-200 bg-white/95 shadow-xl shadow-slate-200/60">
          <BookingFilters filters={filters} onUpdateFilters={updateFilters} onClearFilters={clearFilters} />

          <div className="p-6">
            {viewMode === 'calendar' ? (
              <BookingCalendar bookings={bookings} loading={loading} onSelectBooking={handleViewDetails} />
            ) : (
              <BookingGrid
                bookings={bookings}
                loading={loading}
                viewMode={viewMode === 'grid' ? 'grid' : 'list'}
                onStatusUpdate={handleStatusUpdate}
                onSelectBooking={handleViewDetails}
                onEditBooking={handleEditBooking}
                onDeleteBooking={handleDeleteBooking}
                onArchiveBooking={handleArchive}
                onUnarchiveBooking={handleUnarchive}
              />
            )}
          </div>

          {viewMode !== 'calendar' && pagination.pages > 1 && (
            <div className="rounded-3xl border-t border-slate-100 bg-gradient-to-r from-white via-white to-slate-50 px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-600">
                  {t('bookings.pagination.showing', 'Showing')}{' '}
                  <span className="font-semibold text-slate-900">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                  {t('bookings.pagination.to', 'to')}{' '}
                  <span className="font-semibold text-slate-900">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  {t('bookings.pagination.of', 'of')}{' '}
                  <span className="font-semibold text-slate-900">{pagination.total}</span>{' '}
                  {t('bookings.pagination.results', 'results')}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {t('bookings.pagination.previous', 'Previous')}
                  </button>
                  <div className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/70 p-1">
                    {paginationWindow.map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => changePage(pageNum)}
                        className={`h-8 w-8 rounded-xl text-sm font-semibold transition ${
                          pagination.page === pageNum
                            ? 'bg-[#E39B34] text-white shadow-lg shadow-[#E39B34]/30'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t('bookings.pagination.next', 'Next')}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {editingBooking && (
          <EditBookingModal booking={editingBooking} onClose={() => setEditingBooking(null)} onSave={handleSaveEdit} />
        )}
      </div>
    </div>
  );
};

export default Booking;
