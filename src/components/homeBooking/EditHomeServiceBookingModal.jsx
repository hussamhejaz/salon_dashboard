// src/components/homeBooking/EditHomeServiceBookingModal.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const EditHomeServiceBookingModal = ({ booking, onClose, onSave }) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_area: '',
    customer_address: '',
    customer_notes: '',
    booking_date: '',
    booking_time: '',
    duration_minutes: '',
    service_price: '',
    travel_fee: '',
    total_price: '',
    status: 'pending',
    special_requirements: ''
  });

  // Initialize form data when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        customer_name: booking.customer_name || '',
        customer_phone: booking.customer_phone || '',
        customer_email: booking.customer_email || '',
        customer_area: booking.customer_area || '',
        customer_address: booking.customer_address || '',
        customer_notes: booking.customer_notes || '',
        booking_date: booking.booking_date || '',
        booking_time: booking.booking_time || '',
        duration_minutes: booking.duration_minutes || '',
        service_price: booking.service_price || '',
        travel_fee: booking.travel_fee || '',
        total_price: booking.total_price || '',
        status: booking.status || 'pending',
        special_requirements: booking.special_requirements || ''
      });
    }
  }, [booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare update data
      const updateData = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        customer_area: formData.customer_area,
        customer_address: formData.customer_address,
        customer_notes: formData.customer_notes,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        service_price: parseFloat(formData.service_price) || 0,
        travel_fee: parseFloat(formData.travel_fee) || 0,
        total_price: parseFloat(formData.total_price) || 0,
        status: formData.status,
        special_requirements: formData.special_requirements
      };

      // Only include duration_minutes if it has a value
      if (formData.duration_minutes) {
        updateData.duration_minutes = parseInt(formData.duration_minutes);
      }

      const result = await onSave(booking.id, updateData);
      if (result?.success) {
        onClose();
      } else {
        console.error('Failed to save booking:', result?.error);
      }
    } catch (error) {
      console.error('Error saving home service booking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = {
        ...prev,
        [name]: value
      };

      // Auto-calculate total price when service price or travel fee changes
      if (name === 'service_price' || name === 'travel_fee') {
        const servicePrice = name === 'service_price' ? parseFloat(value) || 0 : parseFloat(prev.service_price) || 0;
        const travelFee = name === 'travel_fee' ? parseFloat(value) || 0 : parseFloat(prev.travel_fee) || 0;
        const totalPrice = (servicePrice + travelFee).toFixed(2);
        updatedData.total_price = totalPrice;
      }

      return updatedData;
    });
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('homeServiceBookings.edit.title', 'Edit Home Service Booking')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('homeServiceBookings.edit.subtitle', 'Update booking details and information')}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('bookings.details.customerDetails', 'Customer Information')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.customerEmail', 'Email')}
                </label>
                <input
                  type="email"
                  name="customer_email"
                  value={formData.customer_email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('homeServiceBookings.area', 'Area')} *
                </label>
                <input
                  type="text"
                  name="customer_area"
                  value={formData.customer_area}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.address', 'Address')} *
                </label>
                <input
                  type="text"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('homeServiceBookings.serviceInfo', 'Service Information')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

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
                  placeholder="Optional"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.status', 'Status')} *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="pending">{t('bookings.status.pending', 'Pending')}</option>
                  <option value="confirmed">{t('bookings.status.confirmed', 'Confirmed')}</option>
                  <option value="completed">{t('bookings.status.completed', 'Completed')}</option>
                  <option value="cancelled">{t('bookings.status.cancelled', 'Cancelled')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('bookings.pricing', 'Pricing Information')}
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('services.price', 'Service Price')} *
                </label>
                <input
                  type="number"
                  name="service_price"
                  value={formData.service_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('homeServiceBookings.travelFee', 'Travel Fee')}
                </label>
                <input
                  type="number"
                  name="travel_fee"
                  value={formData.travel_fee}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.totalPrice', 'Total Price')}
                </label>
                <input
                  type="number"
                  name="total_price"
                  value={formData.total_price}
                  readOnly
                  className="w-full px-3 py-2.5 border border-gray-300 bg-gray-50 rounded-lg text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('bookings.additionalInfo', 'Additional Information')}
              </h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.notes', 'Customer Notes')}
                </label>
                <textarea
                  name="customer_notes"
                  value={formData.customer_notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder={t('homeServiceBookings.notesPlaceholder', 'Any special notes from the customer...')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('homeServiceBookings.specialRequirements', 'Special Requirements')}
                </label>
                <textarea
                  name="special_requirements"
                  value={formData.special_requirements}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  placeholder={t('homeServiceBookings.requirementsPlaceholder', 'Any special requirements for the home service...')}
                />
              </div>
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
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
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

export default EditHomeServiceBookingModal;