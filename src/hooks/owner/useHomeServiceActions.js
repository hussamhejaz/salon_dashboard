// // src/pages/owner/home-service-bookings/hooks/useHomeServiceActions.js
// import { useState } from 'react';

// export const useHomeServiceActions = (onUpdateCallback) => {
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [bookingDetails, setBookingDetails] = useState(null);
//   const [detailsLoading, setDetailsLoading] = useState(false);

//   const fetchBookingDetails = async (bookingId, getBookingById) => {
//     try {
//       setDetailsLoading(true);
//       const result = await getBookingById(bookingId);
//       if (result?.success && result.booking) {
//         setBookingDetails(result.booking);
//         setShowDetailsModal(true);
//       }
//     } catch (error) {
//       console.error('Error fetching booking details:', error);
//     } finally {
//       setDetailsLoading(false);
//     }
//   };

//   const handleShowDetails = (booking, getBookingById) => {
//     setSelectedBooking(booking.id);
//     fetchBookingDetails(booking.id, getBookingById);
//   };

//   const handleUpdateStatus = (bookingId, newStatus, updateBooking) => {
//     return updateBooking(bookingId, { status: newStatus });
//   };

//   const handleCloseModal = () => {
//     setShowDetailsModal(false);
//     setBookingDetails(null);
//     setSelectedBooking(null);
//   };

//   return {
//     selectedBooking,
//     showDetailsModal,
//     bookingDetails,
//     detailsLoading,
//     handleShowDetails,
//     handleUpdateStatus,
//     handleCloseModal
//   };
// };