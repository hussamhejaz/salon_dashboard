// src/components/BookingDetails.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import RiyalIcon from "../../RiyalIcon";

function IconBox({ children, className = "" }) {
  return (
    <div className={`w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 ${className}`}>
      {children}
    </div>
  );
}

export default function BookingDetails({ booking, onClose, onStatusUpdate }) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  if (!booking) return null;

  // ---------- helpers ----------
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(isRTL ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  const formatTime = (timeString) =>
    new Date(`1970-01-01T${timeString}`).toLocaleTimeString(
      isRTL ? "ar-EG" : "en-US",
      { hour: "2-digit", minute: "2-digit", hour12: !isRTL }
    );

  const calculateEndTime = () => {
    const start = new Date(`1970-01-01T${booking.booking_time}`);
    const end = new Date(start.getTime() + (booking.duration_minutes || 0) * 60000);
    return end.toLocaleTimeString(isRTL ? "ar-EG" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !isRTL,
    });
  };

  const formatSAR = (num) =>
    new Intl.NumberFormat(isRTL ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(num || 0));

  // Status badges
  const getStatusInfo = (status) => {
    const statusConfig = {
      pending: { 
        text: t("bookings.status.pending"), 
        actions: ["confirm", "cancel"], 
        bg: "bg-yellow-50", 
        textColor: "text-yellow-800",
        border: "border-yellow-200"
      },
      confirmed: { 
        text: t("bookings.status.confirmed"), 
        actions: ["complete", "cancel"], 
        bg: "bg-blue-50", 
        textColor: "text-blue-800",
        border: "border-blue-200"
      },
      completed: { 
        text: t("bookings.status.completed"), 
        actions: [], 
        bg: "bg-green-50", 
        textColor: "text-green-800",
        border: "border-green-200"
      },
      cancelled: { 
        text: t("bookings.status.cancelled"), 
        actions: [], 
        bg: "bg-red-50", 
        textColor: "text-red-800",
        border: "border-red-200"
      },
      no_show: { 
        text: t("bookings.status.noShow"), 
        actions: [], 
        bg: "bg-gray-100", 
        textColor: "text-gray-600",
        border: "border-gray-300"
      },
    };
    return statusConfig[status] || statusConfig.pending;
  };

  const statusInfo = getStatusInfo(booking.status);
  const handleStatusUpdate = (s) => onStatusUpdate(booking.id, s);

  const isSalonService = !!booking.services;
  const serviceName =
    booking.services?.name || booking.home_services?.name || t("common.serviceNA");
  const serviceType = isSalonService
    ? t("bookings.serviceTypes.salonService")
    : t("bookings.serviceTypes.homeVisit");
  const serviceDuration = `${booking.duration_minutes ?? 0} ${t("bookings.details.duration").toLowerCase()}`;

  const getPaymentStatusText = (status) =>
    ({ 
      pending: t("bookings.paymentStatus.pending"),
      paid: t("bookings.paymentStatus.paid"),
      failed: t("bookings.paymentStatus.failed") 
    }[status] || t("bookings.paymentStatus.pending"));

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t("bookings.details.title", "Booking Details")}</h2>
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Status & Price */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("bookings.details.status", "Status")}</p>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.bg} ${statusInfo.textColor} ${statusInfo.border}`}>
                  {statusInfo.text}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{t("bookings.details.totalAmount", "Total Amount")}</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-50 border border-orange-200 rounded flex items-center justify-center">
                    <RiyalIcon size={14} className="text-orange-600"/>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">
                    {formatSAR(booking.total_price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("bookings.details.appointmentInfo", "Appointment Information")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <IconBox>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{t("bookings.details.date", "Date")}</p>
                    <p className="font-medium text-gray-900">{formatDate(booking.booking_date)}</p>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <IconBox>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{t("bookings.details.time", "Time")}</p>
                    <p className="font-medium text-gray-900">
                      {formatTime(booking.booking_time)} - {calculateEndTime()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service + Duration */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <IconBox>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{t("bookings.details.service", "Service")}</p>
                    <p className="font-medium text-gray-900">{serviceName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <IconBox>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{t("bookings.details.duration", "Duration")}</p>
                    <p className="font-medium text-gray-900">{serviceDuration}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("bookings.details.customerDetails", "Customer Details")}
            </h3>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <IconBox>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{t("bookings.details.customer", "Customer")}</p>
                    <p className="font-medium text-gray-900">{booking.customer_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <IconBox>
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </IconBox>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 mb-1">{t("bookings.details.phone", "Phone")}</p>
                    <a href={`tel:${booking.customer_phone}`} className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                      {booking.customer_phone}
                    </a>
                  </div>
                </div>

                {booking.customer_email && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <IconBox>
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                    </IconBox>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 mb-1">{t("bookings.details.email", "Email")}</p>
                      <a href={`mailto:${booking.customer_email}`} className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                        {booking.customer_email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Type & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">{t("bookings.details.serviceType", "Service Type")}</p>
              <p className="font-medium text-gray-900">{serviceType}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-2">{t("bookings.details.paymentStatus", "Payment Status")}</p>
              <p className="font-medium text-gray-900">{getPaymentStatusText(booking.payment_status)}</p>
            </div>
          </div>

          {booking.notes && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{t("bookings.details.additionalNotes", "Additional Notes")}</h3>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{booking.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="text-sm text-gray-500">
              {t("bookings.details.lastUpdated", "Last updated")}: {new Date(booking.updated_at || Date.now()).toLocaleString(isRTL ? "ar-EG" : "en-US")}
            </div>
            <div className="flex gap-3">
              {statusInfo.actions.includes("cancel") && (
                <button
                  onClick={() => handleStatusUpdate("cancelled")}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t("bookings.actions.cancelBooking", "Cancel Booking")}
                </button>
              )}
              {statusInfo.actions.includes("complete") && (
                <button
                  onClick={() => handleStatusUpdate("completed")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t("bookings.actions.markComplete", "Mark Complete")}
                </button>
              )}
              {statusInfo.actions.includes("confirm") && (
                <button
                  onClick={() => handleStatusUpdate("confirmed")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t("bookings.actions.confirmBooking", "Confirm Booking")}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
              >
                {t("bookings.actions.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}