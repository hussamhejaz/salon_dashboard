// src/pages/owner/home-service-bookings/components/HomeServiceGrid.jsx
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../components/ui/ConfirmModal';
import RiyalIcon from '../RiyalIcon';

const HomeServiceGrid = ({
  bookings,
  loading,
  viewMode,
  onSelectBooking,
  onEditBooking,
  onDeleteBooking,
}) => {
  const { t, i18n } = useTranslation();
  const [deleteModal, setDeleteModal] = useState({ open: false, booking: null });

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'ar-SA' ? 'ar-EG' : 'en-SA', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const formatMoney = (value) => currencyFormatter.format(Number(value || 0));
  const formatDate = (date) =>
    new Date(date).toLocaleDateString(locale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  const formatTime = (time) =>
    new Date(`1970-01-01T${time}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
  const formatDuration = (minutes) => {
    if (!minutes) return '—';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h${mins ? ` ${mins}m` : ''}`;
  };

  const getTimeUntilBooking = (bookingDate, bookingTime) => {
    try {
      const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
      const diffMs = bookingDateTime - new Date();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      if (diffMs < 0) return t('bookings.time.past', 'Past booking');
      if (diffDays > 0) return t('bookings.time.days', 'In {{count}} days', { count: diffDays });
      if (diffHours > 0) return t('bookings.time.hours', 'In {{count}} hours', { count: diffHours });
      return t('bookings.time.soon', 'Soon');
    } catch {
      return '—';
    }
  };

  const statusConfig = {
    pending: {
      chip: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    confirmed: {
      chip: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500',
    },
    completed: {
      chip: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      chip: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const openDeleteModal = (booking) => setDeleteModal({ open: true, booking });
  const confirmDelete = async () => {
    if (deleteModal.booking) {
      await onDeleteBooking?.(deleteModal.booking.id);
      setDeleteModal({ open: false, booking: null });
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={`skeleton-${idx}`}
          className="h-48 rounded-3xl border border-white/50 bg-white/50 shadow-inner shadow-slate-900/5 backdrop-blur animate-pulse"
        />
      ))}
    </div>
  );

  if (loading && bookings.length === 0) {
    return renderSkeleton();
  }

  if (!loading && bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-white/60 bg-white/80 p-10 text-center shadow-sm backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
          </svg>
        </div>
        <h3 className="mt-6 text-2xl font-semibold text-slate-900">
          {t('homeServiceBookings.empty.title', 'No home service bookings found')}
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          {t(
            'homeServiceBookings.empty.subtitle',
            'Adjust your filters or create a new home service booking to get started.'
          )}
        </p>
      </div>
    );
  }

  const CardActions = ({ booking }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEditBooking?.(booking);
        }}
        className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600"
      >
        {t('common.edit', 'Edit')}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openDeleteModal(booking);
        }}
        className="rounded-2xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-400 hover:text-rose-600"
      >
        {t('common.delete', 'Delete')}
      </button>
    </div>
  );

  const renderGridCard = (booking) => {
    const status = statusConfig[booking.status] || statusConfig.pending;
    const timeUntil = getTimeUntilBooking(booking.booking_date, booking.booking_time);

    return (
      <div
        key={booking.id}
        onClick={() => onSelectBooking?.(booking)}
        className="rounded-3xl border border-white/60 bg-white/80 p-5 shadow-md shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-xl cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">{booking.customer_name}</p>
              <p className="text-xs text-slate-500">{booking.customer_phone}</p>
            </div>
          </div>
          <div className="text-right text-xs uppercase tracking-[0.2em] text-slate-400">{timeUntil}</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.chip}`}>
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {t(`bookings.status.${booking.status}`, booking.status)}
          </span>
          {booking.priority && booking.priority !== 'low' && (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {t(`bookings.priority.${booking.priority}`, booking.priority)}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600">
          {booking.home_services?.name && (
            <p className="text-sm font-semibold text-slate-800">{booking.home_services.name}</p>
          )}
          <div className="flex flex-wrap gap-4 text-slate-900">
            <span className="inline-flex items-center gap-1 text-base font-semibold">
              <RiyalIcon size={16} />
              {formatMoney(booking.total_price)}
            </span>
            {booking.travel_fee > 0 && (
              <span className="text-xs text-slate-500">
                +{formatMoney(booking.travel_fee)} {t('homeServiceBookings.travel', 'travel')}
              </span>
            )}
            <span className="text-xs text-slate-500">• {formatDuration(booking.duration_minutes)}</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(booking.booking_date)}
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(booking.booking_time)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {booking.customer_area}
          </div>
          {booking.special_instructions && (
            <p className="rounded-2xl bg-slate-50/80 p-3 text-xs text-slate-500 italic">
              “{booking.special_instructions}”
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/60 pt-4">
          <CardActions booking={booking} />
        </div>
      </div>
    );
  };

  const renderListRow = (booking) => {
    const status = statusConfig[booking.status] || statusConfig.pending;
    const timeUntil = getTimeUntilBooking(booking.booking_date, booking.booking_time);

    return (
      <div
        key={`list-${booking.id}`}
        onClick={() => onSelectBooking?.(booking)}
        className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur transition hover:bg-white cursor-pointer"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
            <div>
              <p className="text-base font-semibold text-slate-900">{booking.customer_name}</p>
              <p className="text-xs text-slate-500">{booking.customer_phone}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.chip}`}>
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                {t(`bookings.status.${booking.status}`, booking.status)}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-900">
                <RiyalIcon size={14} />
                {formatMoney(booking.total_price)}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{timeUntil}</span>
            </div>
          </div>
          <CardActions booking={booking} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-slate-600 md:grid-cols-3">
          {booking.home_services?.name && (
            <div className="font-semibold text-slate-800">{booking.home_services.name}</div>
          )}
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(booking.booking_date)}
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(booking.booking_time)}
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {booking.customer_area}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewMode === 'list' ? (
        <div className="space-y-4">{bookings.map((booking) => renderListRow(booking))}</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {bookings.map((booking) => renderGridCard(booking))}
        </div>
      )}

      <ConfirmModal
        open={deleteModal.open}
        title={t('homeServiceBookings.delete.title', 'Delete Home Service Booking')}
        desc={t(
          'homeServiceBookings.delete.message',
          'Are you sure you want to delete this home service booking? This action cannot be undone.'
        )}
        confirmLabel={t('homeServiceBookings.delete.confirm', 'Delete Home Service')}
        cancelLabel={t('common.cancel', 'Cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ open: false, booking: null })}
        danger
      />
    </>
  );
};

export default HomeServiceGrid;
