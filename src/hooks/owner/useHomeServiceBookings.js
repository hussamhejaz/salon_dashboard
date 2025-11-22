// src/pages/owner/home-service-bookings/hooks/useHomeServiceBookings.js
import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';

export const useHomeServiceBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    date: '',
    customer_phone: '',
    area: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching home service bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE}/api/owner/home-service-bookings/stats/overview`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return {
    bookings,
    stats,
    loading,
    filters,
    setFilters,
    fetchBookings,
    fetchStats
  };
};