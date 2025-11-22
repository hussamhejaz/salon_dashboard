// src/pages/owner/CreateSalonBooking.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';

const CreateSalonBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotStrategy, setSlotStrategy] = useState("");
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_notes: '',
    booking_date: '',
    booking_time: '',
    service_id: '',
    duration_minutes: 30,
    total_price: '',
    status: 'confirmed'
  });

  const [errors, setErrors] = useState({});

  // Fetch salon services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE}/api/owner/services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setServices(data.services || []);
        } else {
          console.error('Failed to fetch services');
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!formData.booking_date || !formData.service_id) {
        setAvailableSlots([]);
        setSlotStrategy("");
        return;
      }

      setSlotsLoading(true);
      setSlotsError("");
      try {
        const token = localStorage.getItem('auth_token');
        const params = new URLSearchParams({
          date: formData.booking_date,
          service_id: formData.service_id,
          duration_minutes: `${formData.duration_minutes || 30}`,
          type: 'salon',
        });
        const response = await fetch(`${API_BASE}/api/owner/availability/slots?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok && data.ok) {
          setAvailableSlots(data.available_slots || []);
          setSlotStrategy(data.slot_strategy || 'working_hours');
          setFormData((prev) => {
            if (!data.available_slots?.length) {
              return prev;
            }
            if (!prev.booking_time || !data.available_slots.includes(prev.booking_time)) {
              return { ...prev, booking_time: data.available_slots[0] };
            }
            return prev;
          });
        } else {
          setAvailableSlots([]);
          setSlotStrategy('');
          setSlotsError(data.error || t('bookings.errors.fetchSlots', 'Failed to load available slots.'));
        }
      } catch (err) {
        setSlotsError(err.message || t('bookings.errors.fetchSlots', 'Failed to load available slots.'));
        setAvailableSlots([]);
        setSlotStrategy('');
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [formData.booking_date, formData.service_id, formData.duration_minutes, t]);

  // Update price and duration when service is selected
  useEffect(() => {
    if (formData.service_id) {
      const selectedService = services.find(s => s.id === formData.service_id);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          total_price: selectedService.price || '',
          duration_minutes: selectedService.duration_minutes || 30
        }));
      }
    }
  }, [formData.service_id, services]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = t('bookings.errors.required', 'This field is required');
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = t('bookings.errors.required', 'This field is required');
    }

    if (!formData.booking_date) {
      newErrors.booking_date = t('bookings.errors.required', 'This field is required');
    }

    if (!formData.booking_time) {
      newErrors.booking_time = t('bookings.errors.required', 'This field is required');
    }

    if (!formData.service_id) {
      newErrors.service_id = t('bookings.errors.selectService', 'Please select a service');
    }

    if (!formData.total_price || parseFloat(formData.total_price) <= 0) {
      newErrors.total_price = t('bookings.errors.validPrice', 'Please enter a valid price');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    // Prepare the data for API
    const bookingData = {
      customer_name: formData.customer_name.trim(),
      customer_phone: formData.customer_phone.trim(),
      customer_email: formData.customer_email.trim(),
      customer_notes: formData.customer_notes.trim(),
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,
      service_id: formData.service_id,
      total_price: parseFloat(formData.total_price),
      duration_minutes: parseInt(formData.duration_minutes),
      status: formData.status
    };

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        // CORRECTED: Navigate to /dashboard/booking (singular)
        navigate('/dashboard/booking');
      } else {
        console.error('Error creating booking:', result.error);
        // Handle specific errors like booking conflicts
        if (result.error === 'BOOKING_CONFLICT') {
          setErrors({
            booking_time: t('bookings.errors.bookingConflict', 'This time slot is already booked. Please choose another time.')
          });
        }
      }
    } catch (error) {
      console.error('Error creating salon booking:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const selectedService = services.find((s) => s.id === formData.service_id);

  const heroHighlights = [
    {
      label: t('bookings.create.hero.services', 'Active services'),
      value: services.length,
      hint: t('bookings.create.hero.servicesHint', 'Available for booking'),
    },
    {
      label: t('bookings.create.hero.duration', 'Default duration'),
      value: `${selectedService?.duration_minutes || 30} ${t('bookings.minutes', 'min')}`,
      hint: t('bookings.create.hero.durationHint', 'Adjust per service'),
    },
    {
      label: t('bookings.create.hero.price', 'Current price'),
      value: formData.total_price ? formatCurrency(formData.total_price) : '—',
      hint: selectedService ? selectedService.name : t('bookings.create.selectService', 'Select Service'),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f3f7ff] p-4 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-white/60 bg-gradient-to-br from-[#fef3e6] via-white to-[#f4f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link to="/dashboard/booking" className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {t('bookings.backToBookings', 'Back to Bookings')}
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                {t('bookings.create.title', 'Create Salon Booking')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {t('bookings.create.subtitle', 'Schedule a new salon appointment')}
              </p>
            </div>
            <div className="grid gap-3 text-center sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.hint}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                {t('bookings.create.bookingDetails', 'Booking Details')}
              </h2>
            </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t('bookings.create.customerInfo', 'Customer Information')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.form.customerName', 'Customer Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent ${
                      errors.customer_name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('bookings.form.customerNamePlaceholder', 'Enter customer name')}
                  />
                  {errors.customer_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.form.phone', 'Phone Number')} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent ${
                      errors.customer_phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={t('bookings.form.phonePlaceholder', 'Enter phone number')}
                  />
                  {errors.customer_phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.customer_phone}</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bookings.form.email', 'Email')}
                </label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleChange('customer_email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent"
                  placeholder={t('bookings.form.emailPlaceholder', 'Enter email address')}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t('bookings.create.dateTime', 'Date & Time')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.form.date', 'Date')} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => handleChange('booking_date', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent ${
                      errors.booking_date ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.booking_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.booking_date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.form.time', 'Time')} *
                  </label>
                  {slotsLoading ? (
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg">
                      <div className="h-4 w-4 border-2 border-[#E39B34] border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-slate-500">
                        {t('bookings.errors.loadingSlots', 'Looking for open slots...')}
                      </span>
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.booking_time}
                      onChange={(e) => handleChange('booking_time', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent ${
                        errors.booking_time ? 'border-red-300' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{t('bookings.form.timePlaceholder', 'Select a time')}</option>
                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  )}
                  {(errors.booking_time || slotsError) && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.booking_time || slotsError}
                    </p>
                  )}
                  {!errors.booking_time && !slotsError && !slotsLoading && !availableSlots.length && formData.booking_date && formData.service_id && (
                    <p className="mt-1 text-sm text-slate-500">
                      {t('bookings.errors.noSlots', 'No available slots were found for the selected date.')}
                    </p>
                  )}
                  {slotStrategy && (
                    <p className="mt-1 text-xs text-slate-500">
                      {t('bookings.slotStrategy.text', 'Slot strategy')}: {t(`bookings.slotStrategy.${slotStrategy}`, slotStrategy)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Service Selection */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t('bookings.create.serviceDetails', 'Service Details')}
              </h3>
              
              {/* Service Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.create.selectService', 'Select Service')} *
                </label>
                {loadingServices ? (
                  <div className="text-center py-4 border border-gray-300 rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E39B34] mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">
                      {t('bookings.loadingServices', 'Loading services...')}
                    </p>
                  </div>
                ) : (
                  <select
                    required
                    value={formData.service_id}
                    onChange={(e) => handleChange('service_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent ${
                      errors.service_id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {t('bookings.create.chooseService', 'Choose a service...')}
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - {formatCurrency(service.price)} ({service.duration_minutes} {t('common.minutes', 'min')})
                      </option>
                    ))}
                  </select>
                )}
                {errors.service_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.service_id}</p>
                )}
              </div>

              {/* Price and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.form.price', 'Service Price')} *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.total_price}
                    onChange={(e) => handleChange('total_price', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent ${
                      errors.total_price ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.total_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.total_price}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('bookings.form.duration', 'Duration (minutes)')} *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.duration_minutes}
                    onChange={(e) => handleChange('duration_minutes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Total Price Display */}
              {formData.total_price && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">
                    {t('bookings.create.totalAmount', 'Total Amount')}: {formatCurrency(formData.total_price)}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">
                {t('bookings.create.additionalInfo', 'Additional Information')}
              </h3>
              
              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('bookings.form.bookingStatus', 'Booking Status')}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent"
                >
                  <option value="pending">{t('bookings.status.pending', 'Pending')}</option>
                  <option value="confirmed">{t('bookings.status.confirmed', 'Confirmed')}</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('bookings.form.customerNotes', 'Customer Notes')}
                </label>
                <textarea
                  rows={4}
                  value={formData.customer_notes}
                  onChange={(e) => handleChange('customer_notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E39B34] focus:border-transparent"
                  placeholder={t('bookings.form.notesPlaceholder', 'Any special requests, allergies, or additional notes...')}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
              <Link
                to="/dashboard/booking"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t('common.cancel', 'Cancel')}
              </Link>
              <button
                type="submit"
                disabled={loadingServices || saving}
                className="rounded-2xl bg-[#E39B34] px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-[#E39B34]/40 transition hover:bg-[#cf8629] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    {t('bookings.creating', 'Creating Booking...')}
                  </span>
                ) : (
                  t('bookings.createBooking', 'Create Booking')
                )}
              </button>
            </div>
          </form>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('bookings.create.serviceDetails', 'Service Details')}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {selectedService ? selectedService.description || selectedService.subtitle : t('bookings.create.selectService', 'Select Service')}
              </p>
              {selectedService && (
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between">
                    <span>{t('bookings.form.price', 'Service Price')}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(selectedService.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('bookings.form.duration', 'Duration (minutes)')}</span>
                    <span className="font-semibold text-slate-900">{selectedService.duration_minutes || 30} {t('bookings.minutes', 'min')}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t('bookings.create.additionalInfo', 'Additional Information')}
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                <li>{t('bookings.tips.reminder', 'Confirm client contact details before saving')}</li>
                <li>{t('bookings.tips.duration', 'Adjust duration for multi-service visits')}</li>
                <li>{t('bookings.tips.payment', 'Record payment status after checkout')}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

// Arrow Left Icon component
const ArrowLeftIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

export default CreateSalonBooking;
