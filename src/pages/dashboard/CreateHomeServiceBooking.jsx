// src/pages/owner/CreateHomeServiceBooking.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';

const CreateHomeServiceBooking = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formatSlotStrategyLabel = (value) => {
    if (!value) return '';
    const strategyMap = {
      manual: t('availability.slotStrategy.manual', 'Manual slots'),
      working_hours: t('availability.slotStrategy.working_hours', 'Standard working hours'),
    };
    return strategyMap[value] || value.replace(/_/g, ' ');
  };

  const [homeServices, setHomeServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
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
    home_service_id: '',
    duration_minutes: 60,
    travel_fee: 0,
    total_price: '',
    status: 'confirmed',
    special_requirements: ''
  });

  const [errors, setErrors] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotStrategy, setSlotStrategy] = useState("");

  // Fetch home services when component mounts
  useEffect(() => {
    const fetchHomeServices = async () => {
      try {
        setLoadingServices(true);
        const token = localStorage.getItem('auth_token');
        
        const response = await fetch(`${API_BASE}/api/owner/home-services`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setHomeServices(data.services || []);
        }
      } catch (error) {
        console.error('Error fetching home services:', error);
        setErrors({ fetch: t('homeServiceBookings.errors.fetchServices', 'Failed to load home services') });
      } finally {
        setLoadingServices(false);
      }
    };

    fetchHomeServices();
  }, [t]);

  // Update price and duration when service is selected
  useEffect(() => {
    if (formData.home_service_id) {
      const selectedService = homeServices.find(
        (service) => String(service.id) === String(formData.home_service_id)
      );
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          total_price: selectedService.price || '',
          duration_minutes: selectedService.duration_minutes || 60
        }));
      }
    }
  }, [formData.home_service_id, homeServices]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = t('validation.required', 'This field is required');
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = t('validation.required', 'This field is required');
    }

    if (!formData.customer_area.trim()) {
      newErrors.customer_area = t('homeServiceBookings.errors.areaRequired', 'Area is required');
    }

    if (!formData.customer_address.trim()) {
      newErrors.customer_address = t('homeServiceBookings.errors.addressRequired', 'Address is required');
    }

    if (!formData.booking_date) {
      newErrors.booking_date = t('validation.required', 'This field is required');
    }

    if (!formData.booking_time) {
      newErrors.booking_time = t('validation.required', 'This field is required');
    }

    if (!formData.home_service_id) {
      newErrors.home_service_id = t('bookings.errors.selectService', 'Please select a service');
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
      customer_area: formData.customer_area.trim(),
      customer_address: formData.customer_address.trim(),
      customer_notes: formData.customer_notes.trim(),
      booking_date: formData.booking_date,
      booking_time: formData.booking_time,
      home_service_id: formData.home_service_id,
      total_price: parseFloat(formData.total_price),
      duration_minutes: parseInt(formData.duration_minutes),
      travel_fee: parseFloat(formData.travel_fee) || 0,
      status: formData.status,
      special_requirements: formData.special_requirements.trim()
    };

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/home-service-bookings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        navigate('/dashboard/home-service-bookings');
      } else {
        setErrors({ submit: result.error || t('homeServiceBookings.errors.createFailed', 'Failed to create booking') });
      }
    } catch (error) {
      console.error('Error creating home service booking:', error);
      setErrors({ submit: t('homeServiceBookings.errors.createFailed', 'Failed to create booking') });
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

  const handleSlotSelect = (slot) => {
    setFormData((prev) => ({ ...prev, booking_time: slot }));
  };

  const formatCurrency = (amount) => {
    if (amount === '' || amount === null || amount === undefined || Number.isNaN(amount)) {
      return '--';
    }
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  const selectedService = homeServices.find(
    (service) => String(service.id) === String(formData.home_service_id)
  );
  const parsedTravelFee = parseFloat(formData.travel_fee);
  const parsedServicePrice = parseFloat(formData.total_price);
  const travelFee = Number.isNaN(parsedTravelFee) ? 0 : parsedTravelFee;
  const servicePrice = Number.isNaN(parsedServicePrice) ? 0 : parsedServicePrice;
  const bookingTotal = servicePrice + travelFee;
  const inputClass = (hasError) =>
    `w-full rounded-2xl border ${hasError ? 'border-rose-300' : 'border-slate-200'} bg-white/70 px-3.5 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-900/5 focus:border-[#E39B34] focus:outline-none focus:ring-2 focus:ring-[#E39B34]/15`;

  const heroHighlights = [
    {
      label: t('homeServiceBookings.create.hero.services', 'Active home services'),
      value: homeServices.length,
      hint: t('homeServiceBookings.create.hero.servicesHint', 'Available for on-site visits'),
    },
    {
      label: t('homeServiceBookings.create.hero.duration', 'Typical duration'),
      value: `${selectedService?.duration_minutes || formData.duration_minutes} ${t('homeServices.minutes', 'min')}`,
      hint: t('homeServiceBookings.create.hero.durationHint', 'Adjust for each booking'),
    },
    {
      label: t('homeServiceBookings.create.hero.travel', 'Travel fee'),
      value: formatCurrency(travelFee),
      hint: t('homeServiceBookings.create.hero.travelHint', 'Update based on distance'),
    },
  ];

  const tips = [
    t('homeServiceBookings.create.tips.address', 'Confirm building/parking details before dispatch'),
    t('homeServiceBookings.create.tips.kit', 'Make sure the stylist has the right kit for the service'),
    t('homeServiceBookings.create.tips.travel', 'Adjust travel fee if the visit is outside your primary zone'),
  ];

  const fallbackDuration = selectedService?.duration_minutes;

  useEffect(() => {
    const bookingDate = formData.booking_date;
    const serviceId = formData.home_service_id;
    const durationInput = formData.duration_minutes;
    if (!bookingDate || !serviceId) {
      setAvailableSlots([]);
      setSlotStrategy('');
      setSlotsError('');
      setSlotsLoading(false);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setSlotsError('');
      try {
        const parsedDuration = parseInt(durationInput, 10);
        const resolvedDuration =
          Number.isInteger(parsedDuration) && parsedDuration > 0
            ? parsedDuration
            : fallbackDuration || 30;
        const params = new URLSearchParams({
          date: bookingDate,
          home_service_id: serviceId,
          duration_minutes: `${resolvedDuration}`,
          type: 'home',
        });
        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${API_BASE}/api/owner/availability/slots?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );
        const data = await response.json();
        if (cancelled) return;
        if (response.ok && data.ok) {
          setAvailableSlots(data.available_slots || []);
          setSlotStrategy(data.slot_strategy || '');
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
          setSlotsError(
            data.error || t('availability.errors.fetchSlots', 'Failed to load available slots.')
          );
        }
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return;
        setAvailableSlots([]);
        setSlotStrategy('');
        setSlotsError(
          err.message || t('availability.errors.fetchSlots', 'Failed to load available slots.')
        );
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    };

    fetchSlots();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    formData.booking_date,
    formData.home_service_id,
    formData.duration_minutes,
    fallbackDuration,
    t,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf5ef] via-white to-[#f4f7ff] p-4 lg:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl border border-white/60 bg-gradient-to-br from-[#fef3e6] via-white to-[#f3f7ff] p-6 shadow-[0_25px_70px_rgba(15,23,42,0.12)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link to="/dashboard/home-service-bookings" className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                {t('homeServiceBookings.back', 'Back to Home Service Bookings')}
              </Link>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                {t('homeServiceBookings.newBooking', 'Create Home Service Booking')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                {t('homeServiceBookings.create.subtitle', 'Schedule a new home service appointment')}
              </p>
            </div>
            <div className="grid gap-3 text-center sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
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
                {t('homeServiceBookings.create.bookingDetails', 'Home Service Booking Details')}
              </h2>
            </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            <section className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {t('bookings.create.customerInfo', 'Customer Information')}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('bookings.form.customerName', 'Customer Name')}*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                    className={inputClass(errors.customer_name)}
                    placeholder={t('bookings.form.customerNamePlaceholder', 'Enter customer name')}
                  />
                  {errors.customer_name && <p className="mt-1 text-xs text-rose-600">{errors.customer_name}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('bookings.form.phone', 'Phone Number')}*
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)}
                    className={inputClass(errors.customer_phone)}
                    placeholder={t('bookings.form.phonePlaceholder', 'Enter phone number')}
                  />
                  {errors.customer_phone && <p className="mt-1 text-xs text-rose-600">{errors.customer_phone}</p>}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('bookings.form.customerEmailOptional', 'Email (Optional)')}
                  </label>
                  <input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleChange('customer_email', e.target.value)}
                    className={inputClass(false)}
                    placeholder={t('bookings.form.emailPlaceholder', 'Enter email address')}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.area', 'Area')}*
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_area}
                    onChange={(e) => handleChange('customer_area', e.target.value)}
                    className={inputClass(errors.customer_area)}
                    placeholder={t('homeServiceBookings.create.areaPlaceholder', 'Enter customer area')}
                  />
                  {errors.customer_area && <p className="mt-1 text-xs text-rose-600">{errors.customer_area}</p>}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  {t('homeServiceBookings.create.address', 'Address')}*
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_address}
                  onChange={(e) => handleChange('customer_address', e.target.value)}
                  className={inputClass(errors.customer_address)}
                  placeholder={t('homeServiceBookings.create.addressPlaceholder', 'Enter full address')}
                />
                {errors.customer_address && <p className="mt-1 text-xs text-rose-600">{errors.customer_address}</p>}
              </div>
            </section>

            <section className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t('bookings.create.dateTime', 'Date & Time')}
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('bookings.form.date', 'Date')}*
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.booking_date}
                    onChange={(e) => handleChange('booking_date', e.target.value)}
                    className={inputClass(errors.booking_date)}
                  />
                  {errors.booking_date && <p className="mt-1 text-xs text-rose-600">{errors.booking_date}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('bookings.form.time', 'Time')}*
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.booking_time}
                    onChange={(e) => handleChange('booking_time', e.target.value)}
                    className={inputClass(errors.booking_time)}
                  />
                  {errors.booking_time && <p className="mt-1 text-xs text-rose-600">{errors.booking_time}</p>}
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/90 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.availableSlots', 'Available slots')}
                  </p>
                  {slotStrategy && (
                    <span className="rounded-full border border-slate-200 px-3 py-0.5 text-xs font-semibold text-slate-600">
                      {formatSlotStrategyLabel(slotStrategy)}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {t('availability.helper', 'Slots refresh automatically when you change the date or service')}
                </p>

                {slotsLoading ? (
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-[#E39B34]/30 border-t-[#E39B34]" />
                    {t('availability.errors.loadingSlots', 'Looking for open slots...')}
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {availableSlots.map((slot) => {
                      const isSelected = formData.booking_time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition focus:outline-none ${
                            isSelected
                              ? 'border-[#E39B34] bg-[#fdeacc] text-[#e07c19]'
                              : 'border-slate-200 bg-white text-slate-900 hover:border-[#E39B34] hover:text-[#E39B34]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}

                {!slotsLoading && !availableSlots.length && (
                  <p className="mt-3 text-xs text-slate-500">
                    {slotsError ||
                      t('homeServiceBookings.create.noSlots', 'No slots available right now. Change the date or service.')}
                  </p>
                )}
                {slotsError && !slotsLoading && (
                  <p className="mt-3 text-xs text-rose-600">{slotsError}</p>
                )}
              </div>
            </section>

            <section className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t('homeServiceBookings.create.serviceInfo', 'Service Information')}
              </p>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t('homeServiceBookings.create.selectService', 'Select Home Service')}*
                </label>
                {loadingServices ? (
                  <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-[#E39B34]/30 border-t-[#E39B34]" />
                      {t('homeServiceBookings.create.loadingServices', 'Loading home services...')}
                    </div>
                    <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                      {t('common.loadingShort', 'Loading')}
                    </span>
                  </div>
                ) : (
                  <select
                    required
                    value={formData.home_service_id}
                    onChange={(e) => handleChange('home_service_id', e.target.value)}
                    className={`${inputClass(errors.home_service_id)} appearance-none pr-10`}
                  >
                    <option value="">
                      {t('homeServiceBookings.create.chooseService', 'Choose a home service...')}
                    </option>
                    {homeServices.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} · {formatCurrency(service.price)} ({service.duration_minutes}{' '}
                        {t('homeServices.minutes', 'min')})
                      </option>
                    ))}
                  </select>
                )}
                {errors.home_service_id && (
                  <p className="text-xs text-rose-600">{errors.home_service_id}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.create.servicePrice', 'Service Price')}*
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.total_price}
                    onChange={(e) => handleChange('total_price', e.target.value)}
                    className={inputClass(errors.total_price)}
                  />
                  {errors.total_price && <p className="mt-1 text-xs text-rose-600">{errors.total_price}</p>}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.create.duration', 'Duration (min)')}*
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={formData.duration_minutes}
                    onChange={(e) => handleChange('duration_minutes', e.target.value)}
                    className={inputClass(false)}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.travelFee', 'Travel Fee')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.travel_fee}
                    onChange={(e) => handleChange('travel_fee', e.target.value)}
                    className={inputClass(false)}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-[#fef8ef] px-4 py-3 text-sm shadow-inner shadow-[#E39B34]/10">
                <div className="flex items-center justify-between text-slate-900">
                  <span className="font-semibold">{t('bookings.details.totalAmount', 'Total Amount')}</span>
                  <span className="text-base font-semibold">{formatCurrency(bookingTotal)}</span>
                </div>
                <p className="mt-1 text-xs text-[#b9822f]">
                  {formatCurrency(servicePrice)} {t('homeServiceBookings.service', 'service')} · {formatCurrency(travelFee)}{' '}
                  {t('homeServiceBookings.travel', 'travel')}
                </p>
              </div>
            </section>

            <section className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {t('homeServiceBookings.create.additionalInfo', 'Additional Information')}
              </p>
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.create.bookingStatus', 'Booking Status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={`${inputClass(false)} appearance-none pr-10`}
                  >
                    <option value="pending">{t('bookings.status.pending', 'Pending')}</option>
                    <option value="confirmed">{t('bookings.status.confirmed', 'Confirmed')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    {t('homeServiceBookings.specialRequirements', 'Special Requirements')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.special_requirements}
                    onChange={(e) => handleChange('special_requirements', e.target.value)}
                    className={`${inputClass(false)} min-h-[120px] resize-none`}
                    placeholder={t(
                      'homeServiceBookings.requirementsPlaceholder',
                      'Any special requirements or instructions...'
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {t('bookings.form.customerNotes', 'Customer Notes')}
                </label>
                <textarea
                  rows={4}
                  value={formData.customer_notes}
                  onChange={(e) => handleChange('customer_notes', e.target.value)}
                  className={`${inputClass(false)} min-h-[140px] resize-none`}
                  placeholder={t('bookings.form.notesPlaceholder', 'Any special requests, allergies, or additional notes...')}
                />
              </div>
            </section>

            {errors.submit && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 shadow-inner shadow-rose-200/40">
                {errors.submit}
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
              <Link
                to="/dashboard/home-service-bookings"
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
                    {t('common.creating', 'Creating...')}
                  </span>
                ) : (
                  t('homeServiceBookings.newBooking', 'Create Home Service Booking')
                )}
              </button>
            </div>
          </form>
        </div>
        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('homeServiceBookings.create.sidebar.title', 'Selected Service')}
            </p>
            {selectedService ? (
              <>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{selectedService.name}</h3>
                {selectedService.description && (
                  <p className="mt-1 text-sm text-slate-600">{selectedService.description}</p>
                )}
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>{t('homeServiceBookings.create.servicePrice', 'Service Price')}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(selectedService.price)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('homeServiceBookings.create.duration', 'Duration (min)')}</span>
                    <span className="font-semibold text-slate-900">
                      {selectedService.duration_minutes || formData.duration_minutes} {t('homeServices.minutes', 'min')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('homeServiceBookings.travelFee', 'Travel Fee')}</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(travelFee)}</span>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-[#fef3e6] px-4 py-3 text-sm">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{t('homeServiceBookings.create.sidebar.total', 'Estimate')}</span>
                    <span>{formatCurrency(bookingTotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    {t('homeServiceBookings.create.sidebar.totalHint', 'Service + travel adjustments')}
                  </p>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-600">
                {t('homeServiceBookings.create.sidebar.placeholder', 'Select a home service to preview pricing and duration.')}
              </p>
            )}
          </div>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('homeServiceBookings.create.tipsTitle', 'Before you confirm')}
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
              {tips.map((tip, index) => (
                <li key={`${tip}-${index}`}>{tip}</li>
              ))}
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

export default CreateHomeServiceBooking;
