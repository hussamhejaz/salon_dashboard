import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { useHomeServiceBookings } from '../../hooks/owner/useHomeServiceBooking';
import HomeServiceStats from '../../components/homeBooking/HomeServiceStats';
import HomeServiceFilters from '../../components/homeBooking/HomeServiceFilters';
import HomeServiceGrid from '../../components/homeBooking/HomeServiceGrid';
import BookingDetailsModal from '../../components/homeBooking/BookingDetailsModal';
import EditHomeServiceBookingModal from '../../components/homeBooking/EditHomeServiceBookingModal';
import RiyalIcon from '../../components/RiyalIcon';
import BookingCalendar from '../../components/calendar/BookingCalendar';

const HomeServiceBookings = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const {
    bookings,
    stats,
    loading,
    filters,
    pagination = { page: 1, limit: 20, total: 0, pages: 0 },
    fetchBookings,
    updateBooking,
    deleteBooking,
    updateFilters,
    clearFilters,
    changePage,
    getTodaysBookings,
    getUpcomingBookings,
    getBookingById,
    autoRefresh,
    setAutoRefresh,
  } = useHomeServiceBookings();

  const [bookingDetails, setBookingDetails] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const todaysBookingsCount = getTodaysBookings().length;
  const upcomingBookingsCount = getUpcomingBookings().length;
  const travelFees = stats?.total_travel_fees || 0;
  const totalBookings = stats?.total_bookings || 0;
  const avgTravelFee = totalBookings > 0 ? travelFees / totalBookings : 0;

  const heroHighlights = [
    {
      label: t('homeServiceBookings.hero.highlights.today', "Today's visits"),
      value: todaysBookingsCount,
      hint: t('homeServiceBookings.hero.highlights.todayHint', 'Confirmed for today'),
    },
    {
      label: t('homeServiceBookings.hero.highlights.upcoming', 'Upcoming visits'),
      value: upcomingBookingsCount,
      hint: t('homeServiceBookings.hero.highlights.upcomingHint', 'Next 7 days'),
    },
    {
      label: t('homeServiceBookings.hero.highlights.travel', 'Avg travel fee'),
      value: (
        <span className="inline-flex items-center gap-2">
          <RiyalIcon size={18} className="text-slate-900" />
          <span>{Math.round(avgTravelFee || 0)}</span>
        </span>
      ),
      hint: t('homeServiceBookings.hero.highlights.travelHint', 'Per completed booking'),
    },
  ];

  // Safe callback hooks
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

  useEffect(() => {
    const homeBookingId = searchParams.get('homeBookingId');
    if (!homeBookingId) return;
    (async () => {
      setLoadingDetails(true);
      try {
        const result = await getBookingById(homeBookingId);
        if (result?.success && result.booking) {
          setBookingDetails(result.booking);
        }
      } finally {
        setLoadingDetails(false);
      }
    })();
  }, [searchParams, getBookingById]);

  // Safe pagination window calculation
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
            {t('homeServiceBookings.list.loading', 'Loading bookings...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-8">
      <div className="mb-8 rounded-3xl border border-white/60 bg-gradient-to-br from-[#fef3e6] via-white to-[#f3f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {t('homeServiceBookings.hero.tag', 'Home visits')}
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 lg:text-4xl">
              {t('homeServiceBookings.hero.title', 'Home Service Bookings')}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {t('homeServiceBookings.hero.subtitle', 'Track technicians on the move, confirm travel fees, and keep home clients in sync.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-2xl border border-white/70 bg-white/70 p-1 shadow-sm">
              {['grid', 'list', 'calendar'].map((mode) => (
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
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h5v5H4zM4 13h5v5H4zM11 6h9v5h-9zM11 13h9v5h-9z" />
                    </svg>
                  ) : mode === 'list' ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">
                    {mode === 'grid'
                      ? t('common.grid', 'Grid')
                      : mode === 'list'
                      ? t('common.list', 'List')
                      : t('bookings.view.calendar', 'Calendar')}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAutoRefresh((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
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

            <Link
              to="/dashboard/home-service-bookings/create"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E39B34] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/30 transition hover:bg-[#cf8629]"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
                {t('homeServiceBookings.newBooking', 'New Booking')}
              </Link>
            </div>
          </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heroHighlights.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <HomeServiceStats
        stats={stats}
        todaysBookings={getTodaysBookings()}
        upcomingBookings={getUpcomingBookings()}
      />

      <div className="rounded-3xl border border-white/60 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur">
        <HomeServiceFilters
          filters={filters}
          onUpdateFilters={updateFilters}
          onClearFilters={clearFilters}
        />

        <div className="p-6">
          {viewMode === 'calendar' ? (
            <BookingCalendar bookings={bookings} loading={loading} onSelectBooking={handleViewDetails} />
          ) : (
            <HomeServiceGrid
              bookings={bookings}
              loading={loading}
              viewMode={viewMode}
              onStatusUpdate={handleStatusUpdate}
              onSelectBooking={handleViewDetails}
              onEditBooking={handleEditBooking}
              onDeleteBooking={handleDeleteBooking}
            />
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex flex-col gap-4 border-t border-white/40 bg-white/70 px-6 py-5 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {t('bookings.pagination.showing', 'Showing')}{' '}
              <span className="font-semibold text-slate-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
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
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('bookings.pagination.previous', 'Previous')}
              </button>

              <div className="flex items-center gap-1">
                {paginationWindow.map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => changePage(pageNum)}
                    className={`h-9 w-9 rounded-2xl text-sm font-semibold transition ${
                      pagination.page === pageNum
                        ? 'bg-[#E39B34] text-white shadow shadow-[#E39B34]/30'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => changePage(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('bookings.pagination.next', 'Next')}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {bookingDetails && (
        <BookingDetailsModal
          booking={bookingDetails}
          loading={loadingDetails}
          onUpdateStatus={handleStatusUpdate}
          onClose={() => setBookingDetails(null)}
        />
      )}

      {editingBooking && (
        <EditHomeServiceBookingModal
          booking={editingBooking}
          onClose={() => setEditingBooking(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Details Loader */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E39B34]"></div>
            <span className="text-gray-700 font-medium">
              {t('homeServiceBookings.details.loading', 'Loading details...')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeServiceBookings;
