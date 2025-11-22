import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { useBookingDashboard } from '../../hooks/owner/useBookingDashboard';
import BookingStats from '../../components/owner/booking/BookingStats';
import BookingFilters from '../../components/owner/booking/BookingFilters';
import BookingGrid from '../../components/owner/booking/BookingGrid';
import BookingDetails from '../../components/owner/booking/BookingDetails';
import EditBookingModal from '../../components/owner/booking/EditBookingModal';

const BookingControl = () => {
  const { t } = useTranslation();

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
    getBookingById,
    autoRefresh,       // 👈 جديد
    setAutoRefresh,    // 👈 جديد
  } = useBookingDashboard();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const handleStatusUpdate = useCallback(
    async (bookingId, newStatus) => {
      const result = await updateBooking(bookingId, { status: newStatus });
      if (result?.success) {
        setBookingDetails(null);
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
    async (booking) => {
      setLoadingDetails(true);
      try {
        const result = await getBookingById(booking.id);
        if (result?.success && result.booking) {
          setBookingDetails(result.booking);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setLoadingDetails(false);
      }
    },
    [getBookingById]
  );

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
      <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] to-[#f4f7fb] flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7fb] p-4 lg:p-8">
      <div className="mb-8 rounded-3xl border border-white/50 bg-gradient-to-br from-[#fef3e6] via-white to-[#f3f7ff] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('bookings.title', 'Booking Management')}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 lg:text-4xl">
              {t(
                'bookings.subtitle',
                'Manage appointments and customer bookings'
              )}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {t(
                'bookings.heroDescription',
                "Monitor today's schedule, upcoming visits, and revenue opportunities in one workspace."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center rounded-2xl border border-white/60 bg-white/70 p-1 shadow-sm">
              {['grid', 'list'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    viewMode === mode
                      ? 'bg-[#0f172a] text-white shadow-lg shadow-slate-900/20'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode === 'grid' ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h5v5H4zM4 13h5v5H4zM11 6h9v5h-9zM11 13h9v5h-9z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {t(
                      `common.${mode}`,
                      mode === 'grid' ? 'Grid' : 'List'
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* 🔴 زر تشغيل/إيقاف التحديث التلقائي */}
            <button
              type="button"
              onClick={() => setAutoRefresh(prev => !prev)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition
                ${
                  autoRefresh
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800'
                }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  autoRefresh ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              />
              {autoRefresh
                ? t('bookings.live.on', 'Live update ON')
                : t('bookings.live.off', 'Live update OFF')}
            </button>

            {/* New booking button */}
            <Link
              to="/dashboard/appointments/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('bookings.newBooking', 'New Booking')}
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: t('bookings.stats.today', "Today's Bookings"),
              value: getTodaysBookings().length,
              hint: t(
                'bookings.stats.todayDesc',
                'Scheduled for today'
              ),
            },
            {
              label: t('bookings.stats.upcoming', 'Upcoming Bookings'),
              value: getUpcomingBookings().length,
              hint: t(
                'bookings.stats.upcomingDesc',
                'Next 7 days'
              ),
            },
            {
              label: t('bookings.stats.total', 'Total Bookings'),
              value: stats.total_bookings || 0,
              hint: t(
                'bookings.stats.totalDesc',
                'All bookings'
              ),
            },
            {
              label: t(
                'bookings.stats.revenue',
                'Revenue (SAR)'
              ),
              value: stats.total_revenue || 0,
              hint: t(
                'bookings.stats.revenueDesc',
                'Total revenue generated'
              ),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur"
            >
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {item.value}
              </p>
              <p className="text-xs text-slate-500">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <BookingStats
        stats={stats}
        todaysBookings={getTodaysBookings()}
        upcomingBookings={getUpcomingBookings()}
      />

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur">
        <BookingFilters
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
        />

        <div className="p-6">
          <BookingGrid
            bookings={bookings}
            loading={loading}
            viewMode={viewMode}
            onStatusUpdate={handleStatusUpdate}
            onSelectBooking={handleViewDetails}
            onEditBooking={handleEditBooking}
            onDeleteBooking={handleDeleteBooking}
          />
        </div>

        {pagination.pages > 1 && (
          <div className="rounded-3xl border-t border-slate-100 bg-gradient-to-r from-white via-white to-slate-50 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600">
                {t('bookings.pagination.showing', 'Showing')}{' '}
                <span className="font-semibold text-slate-900">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                {t('bookings.pagination.to', 'to')}{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}
                </span>{' '}
                {t('bookings.pagination.of', 'of')}{' '}
                <span className="font-semibold text-slate-900">
                  {pagination.total}
                </span>{' '}
                {t('bookings.pagination.results', 'results')}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
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
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {bookingDetails && (
        <BookingDetails
          booking={bookingDetails}
          onClose={() => setBookingDetails(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={handleSaveEdit}
        />
      )}

      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-white/50 bg-white/90 px-6 py-4 shadow-xl backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 animate-spin rounded-full border-2 border-[#E39B34]/30 border-t-[#E39B34]" />
              <span className="text-sm font-semibold text-slate-700">
                {t('bookings.details.loading', 'Loading details...')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingControl;
