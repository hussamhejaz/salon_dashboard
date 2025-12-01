import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import { ToastCtx } from '../../components/ui/ToastContext';

const BookingDetailsPage = () => {
  const { t, i18n } = useTranslation();
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const { pushToast } = useContext(ToastCtx);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE}/api/owner/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data?.error || data?.details || 'Failed to load booking');
        }
        setBooking(data.booking);
      } catch (err) {
        setError(err.message || 'Failed to load booking');
      } finally {
        setLoading(false);
      }
    };
    if (bookingId) load();
  }, [bookingId]);

  const locale = isRTL ? 'ar-EG' : 'en-US';

  const appointmentTime = useMemo(() => {
    if (!booking) return '';
    try {
      const start = new Date(`${booking.booking_date}T${booking.booking_time}`);
      return start.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return `${booking.booking_date} ${booking.booking_time}`;
    }
  }, [booking, locale]);

  const updateStatus = async (status) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_BASE}/api/owner/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || data?.details || 'Failed to update booking');
      }
      let updatedBooking = data.booking;
      // auto-archive if completed
      if (status === 'completed') {
        try {
          const archiveRes = await fetch(`${API_BASE}/api/owner/bookings/${bookingId}/archive`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const archiveData = await archiveRes.json();
          if (archiveRes.ok && archiveData.ok) {
            updatedBooking = archiveData.booking;
          }
        } catch (err) {
          // ignore archive errors here
        }
      }
      setBooking(updatedBooking);
      pushToast?.({
        type: 'success',
        title: t('common.success', 'Success'),
        desc: t('bookings.updated', 'Booking updated successfully'),
      });
    } catch (err) {
      pushToast?.({
        type: 'error',
        title: t('common.error', 'Error'),
        desc: err.message || t('bookings.errors.updateFailed', 'Failed to update booking'),
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('auth_token');
      const action = booking.archived ? 'unarchive' : 'archive';
      const res = await fetch(`${API_BASE}/api/owner/bookings/${bookingId}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || data?.details || 'Failed to update archive state');
      }
      setBooking(data.booking);
      pushToast?.({
        type: 'success',
        title: t('common.success', 'Success'),
        desc: booking.archived
          ? t('bookings.archive.unarchived', 'Booking restored')
          : t('bookings.archive.success', 'Booking archived'),
      });
    } catch (err) {
      pushToast?.({
        type: 'error',
        title: t('common.error', 'Error'),
        desc: err.message || t('bookings.errors.archiveFailed', 'Failed to update booking'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-600">
        {t('common.loading', 'Loading...')}
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← {t('common.back', 'Back')}
        </button>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error || t('bookings.errors.notFound', 'Booking not found')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t('bookings.details.title', 'Booking Details')}
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">{booking.customer_name}</h1>
          <p className="text-sm text-slate-600">{appointmentTime}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            {t(`bookings.status.${booking.status}`, booking.status)}
          </span>
          <button
            onClick={() => navigate('/dashboard/booking')}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {t('common.back', 'Back')}
          </button>
          {booking.status === 'pending' && (
            <button
              disabled={saving}
              onClick={() => updateStatus('confirmed')}
              className="rounded-xl bg-[#E39B34] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#cf8a2f] disabled:opacity-60"
            >
              {t('bookings.actions.confirmBooking', 'Confirm Booking')}
            </button>
          )}
          {booking.status === 'confirmed' && (
            <button
              disabled={saving}
              onClick={() => updateStatus('completed')}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
            >
              {t('bookings.actions.markComplete', 'Mark Complete')}
            </button>
          )}
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              disabled={saving}
              onClick={() => updateStatus('cancelled')}
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-300 disabled:opacity-60"
            >
              {t('bookings.actions.cancelBooking', 'Cancel Booking')}
            </button>
          )}
          {booking.status === 'completed' && (
            <button
              disabled={saving}
              onClick={toggleArchive}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#E39B34] hover:text-[#E39B34] disabled:opacity-60"
            >
              {booking.archived
                ? t('bookings.actions.unarchive', 'Unarchive')
                : t('bookings.actions.archive', 'Archive')}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard title={t('bookings.details.customer', 'Customer')} value={booking.customer_name} />
        <DetailCard title={t('bookings.details.phone', 'Phone')} value={booking.customer_phone} />
        <DetailCard title={t('bookings.details.email', 'Email')} value={booking.customer_email || '—'} />
        <DetailCard
          title={t('bookings.details.service', 'Service')}
          value={booking.services?.name || booking.home_services?.name || t('common.serviceNA', 'N/A')}
        />
        <DetailCard title={t('bookings.details.date', 'Date')} value={booking.booking_date} />
        <DetailCard title={t('bookings.details.time', 'Time')} value={booking.booking_time} />
        <DetailCard
          title={t('bookings.details.totalAmount', 'Total Amount')}
          value={Number(booking.total_price || 0).toLocaleString(locale)}
        />
        <DetailCard title={t('bookings.details.paymentStatus', 'Payment Status')} value={booking.payment_status || '—'} />
      </div>

      {booking.customer_notes && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-sm font-semibold text-slate-800">{t('bookings.details.additionalNotes', 'Additional Notes')}</p>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">{booking.customer_notes}</p>
        </div>
      )}
    </div>
  );
};

function DetailCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 break-words">{value || '—'}</p>
    </div>
  );
}

export default BookingDetailsPage;
