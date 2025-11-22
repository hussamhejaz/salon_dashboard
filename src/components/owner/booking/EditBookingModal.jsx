// src/components/ui/EditBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const EditBookingModal = ({ booking, onClose, onSave }) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_notes: '',
    booking_date: '',
    booking_time: '',
    duration_minutes: '',
    total_price: '',
    status: 'pending'
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        customer_name: booking.customer_name || '',
        customer_phone: booking.customer_phone || '',
        customer_email: booking.customer_email || '',
        customer_notes: booking.customer_notes || '',
        booking_date: booking.booking_date || '',
        booking_time: booking.booking_time || '',
        duration_minutes: booking.duration_minutes || '',
        total_price: booking.total_price || '',
        status: booking.status || 'pending'
      });
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const result = await onSave(booking.id, formData);
      if (result?.success) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving booking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('bookings.edit.title', 'Edit Booking')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('bookings.edit.subtitle', 'Update booking details')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={saving}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('bookings.details.customerDetails', 'Customer Information')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.customerName', 'Customer Name')} *
                </label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.customerPhone', 'Phone Number')} *
                </label>
                <input
                  type="tel"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.form.customerEmail', 'Email')}
              </label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('bookings.details.appointmentInfo', 'Appointment Details')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.date', 'Date')} *
                </label>
                <input
                  type="date"
                  name="booking_date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.time', 'Time')} *
                </label>
                <input
                  type="time"
                  name="booking_time"
                  value={formData.booking_time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.duration', 'Duration (minutes)')}
                </label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  min="0"
                  step="15"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.price', 'Price')} *
                </label>
                <input
                  type="number"
                  name="total_price"
                  value={formData.total_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('bookings.details.status', 'Status')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.form.status', 'Booking Status')} *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors"
              >
                <option value="pending">{t('bookings.status.pending', 'Pending')}</option>
                <option value="confirmed">{t('bookings.status.confirmed', 'Confirmed')}</option>
                <option value="completed">{t('bookings.status.completed', 'Completed')}</option>
                <option value="cancelled">{t('bookings.status.cancelled', 'Cancelled')}</option>
                <option value="no_show">{t('bookings.status.noShow', 'No Show')}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {t('bookings.additionalInfo', 'Additional Information')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('bookings.form.notes', 'Customer Notes')}
              </label>
              <textarea
                name="customer_notes"
                value={formData.customer_notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-[#E39B34] transition-colors resize-none"
                placeholder={t('bookings.form.notesPlaceholder', 'Any additional notes...')}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-sm font-medium text-white bg-[#E39B34] rounded-lg hover:bg-[#d18c2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('common.saving', 'Saving...')}
                </>
              ) : (
                t('common.save', 'Save Changes')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;