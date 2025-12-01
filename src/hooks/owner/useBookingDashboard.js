import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import { ToastCtx } from '../../components/ui/ToastContext';

export const useBookingDashboard = () => {
  const { t } = useTranslation();
  const { pushToast } = useContext(ToastCtx);
  
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    start_date: '',
    end_date: '',
    customer_phone: '',
    service_type: '',
    search: '',
    include_archived: false,
    archived_only: false,
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // ⭐ Auto refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);          // شغّال افتراضياً
  const [refreshInterval, setRefreshInterval] = useState(15000); // 15 ثانية

  // Refs لتفادي مشاكل الـ dependencies
  const filtersRef = useRef(filters);
  const loadingRef = useRef(loading);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // 🔁 Fetch bookings (يدعم silent mode لتحديث بدون Loading)
  const fetchBookings = useCallback(
    async (page = 1, currentFilters = filtersRef.current, options = {}) => {
      const { silent = false } = options;

      try {
        if (!silent) {
          setLoading(true);
        }
        setError('');

        const token = localStorage.getItem('auth_token');
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          nocache: '1', // نجبر الـ backend يتجاهل الـ cache
        });

        // نضيف الفلاتر غير الفارغة فقط
        const effectiveFilters = {
          ...currentFilters,
          include_archived: currentFilters.archived_only ? true : currentFilters.include_archived,
        };

        Object.keys(effectiveFilters).forEach(key => {
          if (effectiveFilters[key]) {
            queryParams.append(key, effectiveFilters[key]);
          }
        });

        const response = await fetch(
          `${API_BASE}/api/owner/bookings?${queryParams}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Too many requests. Please wait a moment and try again.');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.ok) {
          setBookings(data.bookings || []);
          setPagination(prev => ({
            ...prev,
            page: data.pagination?.page || page,
            total: data.pagination?.total || 0,
            pages: data.pagination?.pages || 0
          }));
        } else {
          throw new Error(
            data.error ||
              t('bookings.errors.fetchFailed', 'Failed to load bookings')
          );
        }
      } catch (err) {
        const errorMessage =
          err.message || t('common.error', 'Error loading bookings');
        setError(errorMessage);

        // نتجنب سبام التوست مع الـ auto refresh
        if (!err.message.includes('Too many requests') && !silent) {
          pushToast({
            type: 'error',
            title: t('common.error', 'Error'),
            desc: errorMessage,
          });
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [pagination.limit, t, pushToast]
  );

  // 📊 Fetch booking statistics
  const fetchBookingStats = useCallback(
    async (period = {}) => {
      try {
        const token = localStorage.getItem('auth_token');
        const queryParams = new URLSearchParams({
          ...period,
          nocache: '1',
        });

        const response = await fetch(
          `${API_BASE}/api/owner/bookings/stats/overview?${queryParams}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.ok) {
          setStats(data.stats || {});
          return data.stats;
        } else {
          throw new Error(
            data.error || 'Failed to load booking statistics'
          );
        }
      } catch (err) {
        console.error('Failed to fetch booking stats:', err);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: t('bookings.errors.statsFailed', 'Failed to load statistics'),
        });
        return {};
      }
    },
    [t, pushToast]
  );

  // Get single booking details
  const getBookingById = useCallback(
    async (bookingId) => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!bookingId) {
          throw new Error(t('bookings.errors.notFound', 'Booking not found'));
        }
        const response = await fetch(
          `${API_BASE}/api/owner/bookings/${bookingId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              t('bookings.errors.notFound', 'Booking not found')
            );
          }
          throw new Error(
            data.details ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        if (data.ok) {
          return { success: true, booking: data.booking };
        } else {
          throw new Error(
            data.error ||
              t(
                'bookings.errors.fetchDetailsFailed',
                'Failed to load booking details'
              )
          );
        }
      } catch (err) {
        console.error('Failed to fetch booking details:', err);

        const errorMessage =
          err.message ||
          t(
            'bookings.errors.fetchDetailsFailed',
            'Error loading booking details'
          );

        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: errorMessage,
        });

        return { success: false, error: errorMessage };
      }
    },
    [t, pushToast]
  );

  // Create new booking
  const createBooking = useCallback(
    async (bookingData) => {
      try {
        setSaving(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/api/owner/bookings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bookingData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        if (data.ok) {
          setBookings(prev => [data.booking, ...prev]);
          await fetchBookingStats();

          pushToast({
            type: 'success',
            title: t('common.success', 'Success'),
            desc: t('bookings.created', 'Booking created successfully'),
          });
          return { success: true, booking: data.booking };
        } else {
          throw new Error(
            data.error ||
              t(
                'bookings.errors.createFailed',
                'Failed to create booking'
              )
          );
        }
      } catch (err) {
        const errorMessage =
          err.message ||
          t('bookings.errors.createFailed', 'Error creating booking');
        setError(errorMessage);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setSaving(false);
      }
    },
    [fetchBookingStats, t, pushToast]
  );

  // Update booking status/details
  const updateBooking = useCallback(
    async (bookingId, updateData) => {
      try {
        setSaving(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${API_BASE}/api/owner/bookings/${bookingId}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        if (data.ok) {
          setBookings(prev =>
            prev.map(booking =>
              booking.id === bookingId ? data.booking : booking
            )
          );

          if (updateData.status) {
            await fetchBookingStats();
          }

          pushToast({
            type: 'success',
            title: t('common.success', 'Success'),
            desc: t('bookings.updated', 'Booking updated successfully'),
          });
          return { success: true, booking: data.booking };
        } else {
          throw new Error(
            data.error ||
              t(
                'bookings.errors.updateFailed',
                'Failed to update booking'
              )
          );
        }
      } catch (err) {
        const errorMessage =
          err.message ||
          t('bookings.errors.updateFailed', 'Error updating booking');
        setError(errorMessage);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setSaving(false);
      }
    },
    [fetchBookingStats, t, pushToast]
  );

  // Delete booking function
  const deleteBooking = useCallback(
    async (bookingId) => {
      try {
        setSaving(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${API_BASE}/api/owner/bookings/${bookingId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        if (data.ok) {
          setBookings(prev =>
            prev.filter(booking => booking.id !== bookingId)
          );
          await fetchBookingStats();

          pushToast({
            type: 'success',
            title: t('common.success', 'Success'),
            desc:
              data.message ||
              t(
                'bookings.deleted',
                'Booking deleted successfully'
              ),
          });
          return { success: true };
        } else {
          throw new Error(
            data.error ||
              t(
                'bookings.errors.deleteFailed',
                'Failed to delete booking'
              )
          );
        }
      } catch (err) {
        const errorMessage =
          err.message ||
          t('bookings.errors.deleteFailed', 'Error deleting booking');
        setError(errorMessage);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setSaving(false);
      }
    },
    [fetchBookingStats, t, pushToast]
  );

  // Archive booking (completed only)
  const archiveBooking = useCallback(
    async (bookingId) => {
      try {
        setSaving(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${API_BASE}/api/owner/bookings/${bookingId}/archive`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        if (data.ok) {
          // Remove from list if archived view is hidden; otherwise update
          setBookings(prev => {
            if (!filtersRef.current.include_archived) {
              return prev.filter(booking => booking.id !== bookingId);
            }
            return prev.map(booking => (booking.id === bookingId ? data.booking : booking));
          });
          await fetchBookingStats();
          pushToast({
            type: 'success',
            title: t('common.success', 'Success'),
            desc: t('bookings.archive.success', 'Booking archived'),
          });
          return { success: true, booking: data.booking };
        } else {
          throw new Error(
            data.error ||
              t('bookings.errors.archiveFailed', 'Failed to archive booking')
          );
        }
      } catch (err) {
        const errorMessage =
          err.message ||
          t('bookings.errors.archiveFailed', 'Error archiving booking');
        setError(errorMessage);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setSaving(false);
      }
    },
    [fetchBookingStats, t, pushToast]
  );

  const unarchiveBooking = useCallback(
    async (bookingId) => {
      try {
        setSaving(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const response = await fetch(
          `${API_BASE}/api/owner/bookings/${bookingId}/unarchive`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.details ||
              data.error ||
              `HTTP error! status: ${response.status}`
          );
        }

        if (data.ok) {
          setBookings(prev => {
            // In "archived only" view we should remove it; otherwise update entry
            if (filtersRef.current.archived_only) {
              return prev.filter(booking => booking.id !== bookingId);
            }
            return prev.map(booking => (booking.id === bookingId ? data.booking : booking));
          });
          await fetchBookingStats();
          pushToast({
            type: 'success',
            title: t('common.success', 'Success'),
            desc: t('bookings.archive.unarchived', 'Booking restored'),
          });
          return { success: true, booking: data.booking };
        } else {
          throw new Error(
            data.error ||
              t('bookings.errors.unarchiveFailed', 'Failed to unarchive booking')
          );
        }
      } catch (err) {
        const errorMessage =
          err.message ||
          t('bookings.errors.unarchiveFailed', 'Error unarchiving booking');
        setError(errorMessage);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: errorMessage,
        });
        return { success: false, error: errorMessage };
      } finally {
        setSaving(false);
      }
    },
    [fetchBookingStats, t, pushToast]
  );

  // Cancel booking (for backward compatibility)
  const cancelBooking = useCallback(
    async (bookingId) => {
      return await updateBooking(bookingId, { status: 'cancelled' });
    },
    [updateBooking]
  );

  // Get available time slots
  const getAvailability = useCallback(
    async (date, serviceData = {}) => {
      try {
        const token = localStorage.getItem('auth_token');
        const queryParams = new URLSearchParams({
          date,
          ...serviceData,
        });

        const response = await fetch(
          `${API_BASE}/api/owner/bookings/calendar/availability?${queryParams}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.ok) {
          return {
            success: true,
            available_slots: data.available_slots,
            working_hours: data.working_hours,
          };
        } else {
          throw new Error(
            data.error || 'Failed to load availability'
          );
        }
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        return {
          success: false,
          error: err.message,
          available_slots: [],
          working_hours: null,
        };
      }
    },
    []
  );

  // Debounced filter update
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      date: '',
      start_date: '',
      end_date: '',
      customer_phone: '',
      service_type: '',
      search: '',
      include_archived: false,
      archived_only: false,
    });
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    fetchBookings(newPage);
  }, [fetchBookings]);

  // Quick status updates
  const confirmBooking = useCallback(
    async (bookingId) => {
      return await updateBooking(bookingId, { status: 'confirmed' });
    },
    [updateBooking]
  );

  const completeBooking = useCallback(
    async (bookingId) => {
      const result = await updateBooking(bookingId, { status: 'completed' });
      if (result?.success) {
        await archiveBooking(bookingId);
      }
      return result;
    },
    [updateBooking, archiveBooking]
  );

  const markAsNoShow = useCallback(
    async (bookingId) => {
      return await updateBooking(bookingId, { status: 'no_show' });
    },
    [updateBooking]
  );

  // Calculate today's bookings
  const getTodaysBookings = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(booking => booking.booking_date === today);
  }, [bookings]);

  // Calculate upcoming bookings (next 7 days)
  const getUpcomingBookings = useCallback(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return bookings.filter(booking => {
      const bookingDate = new Date(booking.booking_date);
      return (
        bookingDate >= today &&
        bookingDate <= nextWeek &&
        ['confirmed', 'pending'].includes(booking.status)
      );
    });
  }, [bookings]);

  // 🟢 أول تحميل
  useEffect(() => {
    fetchBookings(1);
    fetchBookingStats();
  }, []); // intentionally empty dependencies

  // ⏱️ Debounced filter effect
  const filtersInitialized = useRef(false);

  useEffect(() => {
    if (!filtersInitialized.current) {
      filtersInitialized.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!loadingRef.current) {
        fetchBookings(1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, fetchBookings]);

  // 🟣 Auto-refresh effect (polling)
  useEffect(() => {
    if (!autoRefresh) return;

    const id = setInterval(() => {
      // silent = true → بدون تغيير حالة loading
      fetchBookings(pagination.page, filtersRef.current, { silent: true });
    }, refreshInterval);

    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchBookings, pagination.page]);

  return {
    // State
    bookings,
    stats,
    loading,
    saving,
    error,
    filters,
    pagination,

    // Auto refresh controls
    autoRefresh,
    setAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    
    // Actions
    fetchBookings,
    fetchBookingStats,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking,
    cancelBooking,
    archiveBooking,
    unarchiveBooking,
    getAvailability,
    
    // Filter management
    updateFilters,
    clearFilters,
    changePage,
    
    // Quick actions
    confirmBooking,
    completeBooking,
    markAsNoShow,
    
    // Utilities
    getTodaysBookings,
    getUpcomingBookings,
    refetch: () => {
      fetchBookings(pagination.page);
      fetchBookingStats();
    },
    
    // Computed values
    totalBookings: pagination.total,
    hasBookings: bookings.length > 0,
  };
};
