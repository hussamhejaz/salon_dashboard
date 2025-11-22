// src/pages/owner/home-service-bookings/hooks/useBookingActions.js
import { useState } from 'react';
import { API_BASE } from '../../config/api';

export const useBookingActions = (onUpdateCallback) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchBookingDetails = async (bookingId) => {
    try {
      setDetailsLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookingDetails(data.booking);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/${bookingId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (response.ok) {
        onUpdateCallback(); // Refresh the list
        if (showDetailsModal && bookingDetails?.id === bookingId) {
          fetchBookingDetails(bookingId); // Refresh details if modal is open
        }
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleShowDetails = (bookingId) => {
    setSelectedBooking(bookingId);
    fetchBookingDetails(bookingId);
  };

  const handleUpdateStatus = (bookingId, newStatus) => {
    updateBookingStatus(bookingId, newStatus);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setBookingDetails(null);
    setSelectedBooking(null);
  };

  return {
    selectedBooking,
    showDetailsModal,
    bookingDetails,
    detailsLoading,
    handleShowDetails,
    handleUpdateStatus,
    handleCloseModal
  };
};