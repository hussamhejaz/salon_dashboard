// src/components/ui/BookingTable.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from '../../ui/ConfirmModal';

const BookingTable = ({ 
  bookings, 
  loading, 
  onSelectBooking,
  onEditBooking,
  onDeleteBooking 
}) => {
  const { t, i18n } = useTranslation();
  const [deleteModal, setDeleteModal] = useState({ open: false, booking: null });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
      no_show: 'bg-gray-100 text-gray-600 border-gray-300'
    };
    return colors[status] || colors.pending;
  };

  const locale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch { return dateString || '—'; }
  };

  const formatTime = (timeString) => {
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(locale, { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch { return timeString || '—'; }
  };

  const formatMoney = (value) => {
    const num = Number(value || 0);
    return new Intl.NumberFormat(
      i18n.language === 'ar' ? 'ar-EG' : 'en-US',
      { minimumFractionDigits: 0, maximumFractionDigits: 2 }
    ).format(num);
  };

  const handleDeleteClick = (booking) => setDeleteModal({ open: true, booking });

  const handleDeleteConfirm = async () => {
    if (deleteModal.booking && onDeleteBooking) {
      await onDeleteBooking(deleteModal.booking.id);
      setDeleteModal({ open: false, booking: null });
    }
  };

  const handleEditClick = (booking) => {
    onEditBooking && onEditBooking(booking);
  };

  const getEmployeeName = (booking) => {
    return (
      booking.employee_name ||
      booking.employee?.full_name ||
      booking.employee?.name ||
      '—'
    );
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E39B34]"></div>
      </div>
    );
  }

  if (bookings.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto mb-5 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t('bookings.empty.title', 'No bookings found')}
        </h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          {t('bookings.empty.subtitle', 'No bookings match your current criteria')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.customer', 'Customer')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.service', 'Service')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.employee', 'Employee')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.dateTime', 'Date & Time')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.price', 'Price')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.status', 'Status')}
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {t('bookings.table.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr 
                key={booking.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onSelectBooking && onSelectBooking(booking)}
              >
                {/* Customer Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-gray-900">
                        {booking.customer_name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {booking.customer_phone}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Service Column */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {booking.services?.name || booking.home_services?.name || 'N/A'}
                  </div>
                  {booking.duration_minutes && (
                    <div className="text-sm text-gray-500 mt-1">
                      {booking.duration_minutes} {t('bookings.minutes', 'min')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {getEmployeeName(booking)}
                  </div>
                </td>

                {/* Date & Time Column */}
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(booking.booking_date)}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTime(booking.booking_time)}
                  </div>
                </td>

                {/* Price Column */}
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatMoney(booking.total_price)}
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                    {t(`bookings.status.${booking.status}`, booking.status)}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditClick(booking); }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t('common.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(booking); }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('common.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={deleteModal.open}
        title={t('bookings.delete.title', 'Delete Booking')}
        desc={t('bookings.delete.message', 'Are you sure you want to delete this booking? This action cannot be undone.')}
        confirmLabel={t('bookings.delete.confirm', 'Delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ open: false, booking: null })}
        danger={true}
      />
    </>
  );
};

export default BookingTable;
