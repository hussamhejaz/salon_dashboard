// src/pages/owner/home-service-bookings/components/BookingDetailsModal.jsx
import React, { useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import RiyalIcon from "../../components/RiyalIcon";
import { resolveEmployeeName as resolveEmployeeNameUtil } from "../../utils/resolveEmployeeName";

const STATUS_CONFIG = {
  pending: { 
    text: "bookings.status.pending", 
    actions: ["confirm", "cancel"], 
    bg: "bg-yellow-50", 
    textColor: "text-yellow-800",
    border: "border-yellow-200"
  },
  confirmed: { 
    text: "bookings.status.confirmed", 
    actions: ["complete", "cancel"], 
    bg: "bg-blue-50", 
    textColor: "text-blue-800",
    border: "border-blue-200"
  },
  completed: { 
    text: "bookings.status.completed", 
    actions: [], 
    bg: "bg-green-50", 
    textColor: "text-green-800",
    border: "border-green-200"
  },
  cancelled: { 
    text: "bookings.status.cancelled", 
    actions: [], 
    bg: "bg-gray-100", 
    textColor: "text-gray-600",
    border: "border-gray-300"
  },
};

// Helper functions
const bookingHelpers = {
  formatDate: (dateString, isRTL) =>
    new Date(dateString).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    }),

  formatTime: (timeString, isRTL) =>
    new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
      isRTL ? "ar-EG" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: !isRTL }
    ),

  calculateEndTime: (bookingTime, durationMinutes, isRTL) => {
    if (!durationMinutes) return '';
    const start = new Date(`1970-01-01T${bookingTime}`);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return end.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !isRTL,
    });
  },

  formatSAR: (num, isRTL) =>
    new Intl.NumberFormat(isRTL ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(num || 0)),

  getStatusInfo: (status, t) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return {
      ...config,
      text: t(config.text),
    };
  },
};

// Sub-components
function IconBox({ children, className = "" }) {
  return (
    <div className={`w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

const BookingHeader = ({ booking, onClose, t }) => (
  <div className="px-6 py-4 border-b border-gray-200 bg-white">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t("homeServiceBookings.details.title", "Booking Details")}</h2>
          <p className="text-sm text-gray-500">#{booking.id?.slice(-8).toUpperCase() || "N/A"}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  </div>
);

const StatusSection = ({ statusInfo, formattedPrice, t }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{t("bookings.details.status")}</p>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bg} ${statusInfo.textColor} ${statusInfo.border}`}>
          {statusInfo.text}
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{t("bookings.details.totalAmount")}</p>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-50 border border-orange-200 rounded flex items-center justify-center">
            <RiyalIcon size={14} className="text-orange-600"/>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            {formattedPrice}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const ActionButtons = ({ statusInfo, onStatusUpdate, onClose, bookingId, t }) => (
  <div className="flex gap-3">
    {statusInfo.actions.includes("cancel") && (
      <button
        onClick={() => onStatusUpdate(bookingId, "cancelled")}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      >
        {t("bookings.actions.cancelBooking")}
      </button>
    )}
    {statusInfo.actions.includes("complete") && (
      <button
        onClick={() => onStatusUpdate(bookingId, "completed")}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {t("bookings.actions.markComplete")}
      </button>
    )}
    {statusInfo.actions.includes("confirm") && (
      <button
        onClick={() => onStatusUpdate(bookingId, "confirmed")}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        {t("bookings.actions.confirmBooking")}
      </button>
    )}
    <button
      onClick={onClose}
      className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
    >
      {t("bookings.actions.close")}
    </button>
  </div>
);

const LoadingSkeleton = () => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading...</p>
      </div>
    </div>
  </div>
);

const InfoRow = ({ icon, label, value, isLink = false, href = null }) => (
  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
    <IconBox>
      {icon}
    </IconBox>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      {isLink && href ? (
        <a 
          href={href} 
          className="font-medium text-gray-900 hover:text-orange-600 transition-colors block truncate"
        >
          {value}
        </a>
      ) : (
        <p className="font-medium text-gray-900">{value}</p>
      )}
    </div>
  </div>
);

// Custom hook for booking details logic
function useBookingDetails(booking, isRTL) {
  return useMemo(() => {
    if (!booking) return {};
    
    return {
      formattedDate: bookingHelpers.formatDate(booking.booking_date, isRTL),
      formattedTime: bookingHelpers.formatTime(booking.booking_time, isRTL),
      endTime: bookingHelpers.calculateEndTime(booking.booking_time, booking.duration_minutes, isRTL),
      formattedPrice: bookingHelpers.formatSAR(booking.total_price, isRTL),
      servicePrice: bookingHelpers.formatSAR(booking.service_price, isRTL),
      travelFee: bookingHelpers.formatSAR(booking.travel_fee || 0, isRTL),
    };
  }, [booking, isRTL]);
}

// Main Component
export default function BookingDetailsModal({ booking, loading, onUpdateStatus, onClose }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const modalRef = useRef(null);
  
  const {
    formattedDate,
    formattedTime,
    endTime,
    formattedPrice,
    servicePrice,
    travelFee,
  } = useBookingDetails(booking, isRTL);

  const statusInfo = useMemo(() => 
    bookingHelpers.getStatusInfo(booking?.status, t), 
    [booking?.status, t]
  );

  // Focus management and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!booking) return null;

  // Safe data access with fallbacks
  const serviceName = booking.home_services?.name || t("common.serviceNA");
  const serviceCategory = booking.home_services?.category || t("common.notAvailable");
  const customerName = booking.customer_name || t("common.notProvided");
  const customerPhone = booking.customer_phone || t("common.notProvided");
  const customerArea = booking.customer_area || t("common.notProvided");
  const customerAddress = booking.customer_address || t("common.notProvided");
  const serviceDuration = booking.duration_minutes ? 
    `${booking.duration_minutes} ${t("bookings.minutes", "minutes")}` : 
    t("common.notSpecified");
  const employeeName = resolveEmployeeNameUtil(
    booking,
    t("employees.table.noStaff", "No staff assigned")
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      dir={isRTL ? "rtl" : "ltr"}
      ref={modalRef}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        <BookingHeader booking={booking} onClose={onClose} t={t} />
        
        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          <StatusSection statusInfo={statusInfo} formattedPrice={formattedPrice} t={t} />

          {/* Service Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("homeServiceBookings.serviceInfo", "Service Information")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                }
                label={t("bookings.details.service")}
                value={serviceName}
              />

              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                }
                label={t("services.category", "Category")}
                value={serviceCategory}
              />

              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
                label={t("bookings.details.duration")}
                value={serviceDuration}
              />

              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                }
                label={t("homeServiceBookings.travelFee", "Travel Fee")}
                value={travelFee}
              />
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("bookings.details.appointmentInfo")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                }
                label={t("bookings.details.date")}
                value={formattedDate}
              />

              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
                label={t("bookings.details.time")}
                value={endTime ? `${formattedTime} - ${endTime}` : formattedTime}
              />
              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 7l7-4 7 4v6a8 8 0 11-14 0V7z" />
                  </svg>
                }
                label={t("bookings.table.employee", "Employee")}
                value={employeeName}
              />

            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("bookings.details.customerDetails")}
            </h3>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  icon={
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  }
                  label={t("bookings.details.customer")}
                  value={customerName}
                />

                <InfoRow
                  icon={
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  }
                  label={t("bookings.details.phone")}
                  value={customerPhone}
                  isLink={true}
                  href={`tel:${booking.customer_phone}`}
                />

                {booking.customer_email && (
                  <div className="md:col-span-2">
                    <InfoRow
                      icon={
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      }
                      label={t("bookings.details.email")}
                      value={booking.customer_email}
                      isLink={true}
                      href={`mailto:${booking.customer_email}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("homeServiceBookings.locationInfo", "Location Information")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  </svg>
                }
                label={t("homeServiceBookings.area", "Area")}
                value={customerArea}
              />

              <div className="md:col-span-2">
                <InfoRow
                  icon={
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                    </svg>
                  }
                  label={t("bookings.form.address", "Address")}
                  value={customerAddress}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(booking.customer_notes || booking.special_requirements) && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {t("bookings.additionalInfo", "Additional Information")}
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                {booking.customer_notes && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {t("bookings.form.notes", "Customer Notes")}
                    </p>
                    <p className="text-gray-800 leading-relaxed">{booking.customer_notes}</p>
                  </div>
                )}
                {booking.special_requirements && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {t("homeServiceBookings.specialRequirements", "Special Requirements")}
                    </p>
                    <p className="text-gray-800 leading-relaxed">{booking.special_requirements}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("bookings.pricing", "Pricing Breakdown")}
            </h3>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("services.price", "Service Price")}</span>
                  <span className="font-medium text-gray-900">{servicePrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t("homeServiceBookings.travelFee", "Travel Fee")}</span>
                  <span className="font-medium text-gray-900">{travelFee}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{t("bookings.totalPrice", "Total Amount")}</span>
                  <span className="font-bold text-lg text-gray-900">{formattedPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-sm text-gray-500">
              {t("bookings.details.lastUpdated")}: {new Date(booking.updated_at || Date.now()).toLocaleString(isRTL ? "ar-EG" : "en-US")}
            </div>
            <ActionButtons 
              statusInfo={statusInfo} 
              onStatusUpdate={onUpdateStatus} 
              onClose={onClose} 
              bookingId={booking.id}
              t={t}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
