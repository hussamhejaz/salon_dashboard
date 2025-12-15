// src/components/owner/booking/BookingGrid.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../ui/ConfirmModal';
import RiyalIcon from '../../RiyalIcon';
import { resolveEmployeeName as resolveEmployeeNameUtil } from '../../../utils/resolveEmployeeName';

const BookingGrid = ({
  bookings,
  loading,
  viewMode,
  onSelectBooking,
  onEditBooking,
  onDeleteBooking,
  onArchiveBooking,
  onUnarchiveBooking,
}) => {
  const { t, i18n } = useTranslation();
  const [deleteModal, setDeleteModal] = useState({ open: false, booking: null });

  const getStatusTone = (status) => {
    const tones = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200',
      confirmed: 'bg-sky-50 text-sky-700 border-sky-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
      no_show: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return tones[status] || tones.pending;
  };

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const getEmployeeName = (booking) =>
    resolveEmployeeNameUtil(booking, t('employees.table.noStaff', 'No staff assigned'));

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return value || '—';
    }
  };

  const formatTime = (value) => {
    try {
      return new Date(`1970-01-01T${value}`).toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });
    } catch {
      return value || '—';
    }
  };

  const formatMoney = (value) => {
    const num = Number(value || 0);
    return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const handleDeleteClick = (booking) => setDeleteModal({ open: true, booking });

  const handleDeleteConfirm = async () => {
    if (deleteModal.booking && onDeleteBooking) {
      await onDeleteBooking(deleteModal.booking.id);
      setDeleteModal({ open: false, booking: null });
    }
  };

  const handleArchive = (booking, e) => {
    e.stopPropagation();
    if (booking.archived) {
      onUnarchiveBooking && onUnarchiveBooking(booking.id);
    } else if (booking.status === 'completed') {
      onArchiveBooking && onArchiveBooking(booking.id);
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur">
            <div className="h-5 w-24 rounded-full bg-slate-100" />
            <div className="mt-4 h-6 w-32 rounded-full bg-slate-100" />
            <div className="mt-6 space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-100" />
              <div className="h-3 w-3/4 rounded-full bg-slate-100" />
              <div className="h-3 w-2/3 rounded-full bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (bookings.length === 0 && !loading) {
    return (
      <div className="rounded-3xl border border-white/70 bg-white/90 px-6 py-12 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-slate-900">{t('bookings.empty.title', 'No bookings found')}</h3>
        <p className="mt-2 text-sm text-slate-500">{t('bookings.empty.subtitle', 'No bookings match your current criteria')}</p>
      </div>
    );
  }

  const ListRow = ({ booking }) => (
    <div
      className="group rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      onClick={() => onSelectBooking && onSelectBooking(booking)}
    >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <h4 className="text-lg font-semibold text-slate-900">{booking.customer_name}</h4>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(booking.status)}`}>
                    {t(`bookings.status.${booking.status}`)}
                  </span>
                  {booking.archived && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                      {t('bookings.labels.archived', 'Archived')}
                    </span>
              )}
            </div>
          </div>
              <p className="text-sm text-slate-500">{booking.services?.name || booking.home_services?.name}</p>
              <p className="text-xs font-semibold text-slate-700">
                {t('bookings.table.employee', 'Employee')}: {getEmployeeName(booking)}
              </p>
            </div>
            <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBooking && onEditBooking(booking);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600"
              >
                {t('common.edit')}
              </button>
              {(booking.status === 'completed' || booking.archived) && (
                <button
                  onClick={(e) => handleArchive(booking, e)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    booking.archived
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'
                  }`}
                >
                  {booking.archived
                    ? t('bookings.actions.unarchive', 'Unarchive')
                    : t('bookings.actions.archive', 'Archive')}
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(booking);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-600"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
      <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
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
          <RiyalIcon size={14} />
          <span className="font-semibold text-slate-900">{formatMoney(booking.total_price)}</span>
        </div>
      </div>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <ListRow key={booking.id} booking={booking} />
          ))}
        </div>
        <ConfirmModal
          open={deleteModal.open}
          title={t('bookings.delete.title', 'Delete Booking')}
          desc={t('bookings.delete.message', 'Are you sure you want to delete this booking? This action cannot be undone.')}
          confirmLabel={t('bookings.delete.confirm', 'Delete')}
          cancelLabel={t('common.cancel')}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModal({ open: false, booking: null })}
          danger
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="group rounded-3xl border border-white/70 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"
            onClick={() => onSelectBooking && onSelectBooking(booking)}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h4 className="text-lg font-semibold text-slate-900">{booking.customer_name}</h4>
                <p className="text-sm text-slate-500">{booking.customer_phone}</p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusTone(booking.status)}`}>
                {t(`bookings.status.${booking.status}`)}
              </span>
            </div>
            <p className="mb-3 line-clamp-2 text-base font-semibold text-slate-900">
              {booking.services?.name || booking.home_services?.name}
            </p>
            <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
              {booking.duration_minutes && (
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {booking.duration_minutes} {t('bookings.minutes', 'min')}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-base font-semibold text-slate-900">
                <RiyalIcon size={14} />
                {formatMoney(booking.total_price)}
              </span>
            </div>
            <div className="space-y-2 text-sm text-slate-600">
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
            <div className="mt-2 text-xs font-semibold text-slate-700">
              {t('bookings.table.employee', 'Employee')}: {getEmployeeName(booking)}
            </div>
          <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 opacity-0 transition group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditBooking && onEditBooking(booking);
              }}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600"
            >
              {t('common.edit')}
            </button>
            {booking.status === 'completed' || booking.archived ? (
              <button
                onClick={(e) => handleArchive(booking, e)}
                className={`flex-1 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                  booking.archived
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-700'
                }`}
              >
                {booking.archived
                  ? t('bookings.actions.unarchive', 'Unarchive')
                  : t('bookings.actions.archive', 'Archive')}
              </button>
            ) : null}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(booking);
              }}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:border-rose-400 hover:text-rose-600"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmModal
        open={deleteModal.open}
        title={t('bookings.delete.title', 'Delete Booking')}
        desc={t('bookings.delete.message', 'Are you sure you want to delete this booking? This action cannot be undone.')}
        confirmLabel={t('bookings.delete.confirm', 'Delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, booking: null })}
        danger
      />
    </>
  );
};

export default BookingGrid;
