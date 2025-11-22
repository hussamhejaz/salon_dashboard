import { useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE } from '../../config/api';

const DEFAULT_FILTERS = {
  status: '',
  date: '',
  start_date: '',
  end_date: '',
  customer_phone: '',
  area: '',
  search: '',
};

export const useHomeServiceBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshInterval = 15000;

  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const filtersRef = useRef(filters);

  const fetchBookings = useCallback(
    async (page = 1, currentFilters = filters, options = {}) => {
      const { silent = false } = options;
      try {
        if (!silent) {
          setLoading(true);
        }
        const token = localStorage.getItem('auth_token');
        const queryParams = new URLSearchParams();

        // Add filters
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });

        // Add pagination
        queryParams.append('page', page);
        queryParams.append('limit', pagination.limit);

        const response = await fetch(
          `${API_BASE}/api/owner/home-service-bookings?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setBookings(data.bookings || []);
          setPagination((prev) => ({
            ...prev,
            page: data.pagination?.page || page,
            total: data.pagination?.total || 0,
            pages: data.pagination?.pages || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching home service bookings:', error);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [filters, pagination.limit]
  );

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/stats/overview`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching home service stats:', error);
    }
  }, []);

  const updateBooking = useCallback(async (bookingId, updateData) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/${bookingId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.booking) {
          setBookings((prev) =>
            prev.map((booking) =>
              booking.id === data.booking.id ? data.booking : booking
            )
          );
          await fetchStats();
        }
        return { success: true, booking: data.booking };
      }
      return { success: false, error: 'Failed to update booking' };
    } catch (error) {
      console.error('Error updating home service booking:', error);
      return { success: false, error: error.message };
    }
  }, [fetchStats]);

  const deleteBooking = useCallback(async (bookingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/${bookingId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
        setPagination((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
        await fetchStats();
        return { success: true };
      }
      return { success: false, error: 'Failed to delete booking' };
    } catch (error) {
      console.error('Error deleting home service booking:', error);
      return { success: false, error: error.message };
    }
  }, [fetchStats]);

  const getBookingById = useCallback(async (bookingId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return { success: true, booking: data.booking };
      }
      return { success: false, error: 'Failed to fetch booking' };
    } catch (error) {
      console.error('Error fetching home service booking:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateFilters = useCallback((newFilters = {}) => {
    setFilters((prev) => {
      const next = { ...prev, ...newFilters };
      const hasChanged = Object.keys(next).some((key) => next[key] !== prev[key]);
      return hasChanged ? next : prev;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(() => ({ ...DEFAULT_FILTERS }));
  }, []);

  const changePage = useCallback(
    (page) => {
      fetchBookings(page);
    },
    [fetchBookings]
  );

  // Helper functions
  const getTodaysBookings = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter((booking) => booking.booking_date === today);
  }, [bookings]);

  const getUpcomingBookings = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return bookings.filter(
      (booking) =>
        booking.booking_date >= today &&
        booking.booking_date <= nextWeekStr &&
        ['pending', 'confirmed'].includes(booking.status)
    );
  }, [bookings]);

  const statsFetchedRef = useRef(false);
  const prevFiltersRef = useRef();
  const prevLimitRef = useRef();
  // Keep a ref to the filters for silent polling updates
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch stats once on mount (avoid duplicate calls in StrictMode)
  useEffect(() => {
    if (statsFetchedRef.current) return;
    statsFetchedRef.current = true;
    fetchStats();
  }, [fetchStats]);

  // Fetch bookings on mount and whenever filters / limit change.
  // Guard against StrictMode double-invocation by ensuring something actually changed.
  useEffect(() => {
    const isFirstRun = prevFiltersRef.current === undefined && prevLimitRef.current === undefined;
    const filtersChanged = prevFiltersRef.current !== filters;
    const limitChanged = prevLimitRef.current !== pagination.limit;

    if (!isFirstRun && !filtersChanged && !limitChanged) {
      return;
    }

    prevFiltersRef.current = filters;
    prevLimitRef.current = pagination.limit;
    fetchBookings(1);
  }, [filters, pagination.limit, fetchBookings]);

  useEffect(() => {
    if (!autoRefresh) return;

    const id = setInterval(() => {
      fetchBookings(pagination.page, filtersRef.current, { silent: true });
    }, refreshInterval);

    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchBookings, pagination.page]);

  return {
    bookings,
    stats,
    loading,
    filters,
    pagination,
    autoRefresh,
    setAutoRefresh,
    fetchBookings,
    updateBooking,
    deleteBooking,
    updateFilters,
    clearFilters,
    changePage,
    getTodaysBookings,
    getUpcomingBookings,
    getBookingById,
  };
};
