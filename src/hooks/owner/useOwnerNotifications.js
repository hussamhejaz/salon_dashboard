import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import { ToastCtx } from '../../components/ui/ToastContext';

// Fetch notifications for owner with filters + pagination.
export const useOwnerNotifications = ({
  initialPage = 1,
  initialLimit = 20,
  initialStatus = '',
  autoRefresh = false,
  refreshInterval = 15000,
} = {}) => {
  const { t } = useTranslation();
  const { pushToast } = useContext(ToastCtx);

  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [filters, setFilters] = useState({
    status: initialStatus, // '', 'unread', 'read'
    since: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(
    async (params = {}) => {
      const page = params.page ?? pagination.page;
      const limit = params.limit ?? pagination.limit;
      const status = params.status ?? filters.status;
      const since = params.since ?? filters.since;

      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (status) queryParams.append('status', status);
        if (since) queryParams.append('since', since);

        // add nocache to avoid 304 with empty body
        queryParams.append('nocache', Date.now().toString());

        const response = await fetch(`${API_BASE}/api/owner/notifications?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
            'If-None-Match': 'no-match',
            'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
          },
          cache: 'no-store',
        });

        // Handle 304 (Not Modified) gracefully by keeping current data
        if (response.status === 304) {
          // Try a one-time forced fetch with an extra buster to bypass intermediary caches
          const forceParams = new URLSearchParams(queryParams);
          forceParams.append('force', Date.now().toString());
          const forced = await fetch(`${API_BASE}/api/owner/notifications?${forceParams.toString()}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              'If-None-Match': 'no-match',
              'If-Modified-Since': 'Thu, 01 Jan 1970 00:00:00 GMT',
            },
            cache: 'no-store',
          });
          if (forced.status === 304) {
            setFilters((prev) => ({ ...prev, status, since }));
            return;
          }
          const forcedData = await forced.json();
          if (!forced.ok || !forcedData.ok) {
            throw new Error(
              forcedData?.error ||
                forcedData?.details ||
                t('notifications.errors.fetch', 'Failed to load notifications')
            );
          }
          setNotifications(forcedData.notifications || []);
          setPagination({
            page: forcedData.pagination?.page || page,
            limit: forcedData.pagination?.limit || limit,
            total: forcedData.pagination?.total || forcedData.notifications?.length || 0,
            pages: forcedData.pagination?.pages || 0,
          });
          setFilters((prev) => ({ ...prev, status, since }));
          return;
        }

        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(
            data?.error ||
              data?.details ||
              t('notifications.errors.fetch', 'Failed to load notifications') // i18n key
          );
        }

        setNotifications(data.notifications || []);
        setPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || limit,
          total: data.pagination?.total || data.notifications?.length || 0,
          pages: data.pagination?.pages || 0,
        });
        setFilters((prev) => ({ ...prev, status, since }));
      } catch (err) {
        const message = err.message || t('notifications.errors.fetch', 'Failed to load notifications');
        setError(message);
        pushToast({
          type: 'error',
          title: t('common.error', 'Error'),
          desc: message,
        });
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, filters.status, filters.since, t, pushToast]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Optional auto-refresh/polling
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchNotifications({ page: 1 });
    }, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, fetchNotifications]);

  const refetch = useCallback(
    (opts = {}) => fetchNotifications(opts),
    [fetchNotifications]
  );

  const markAsRead = useCallback(
    async (id) => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/api/owner/notifications/${id}/read?nocache=${Date.now()}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          cache: 'no-store',
        });

        if (!response.ok) {
          return false;
        }

        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n)));
        return true;
      } catch {
        return false;
      }
    },
    []
  );

  const controls = useMemo(
    () => ({
      setPage: (page) => setPagination((prev) => ({ ...prev, page })),
      setLimit: (limit) => setPagination((prev) => ({ ...prev, limit })),
      setFilters,
    }),
    []
  );

  return {
    notifications,
    pagination,
    filters,
    loading,
    error,
    refetch,
    markAsRead,
    ...controls,
  };
};

export default useOwnerNotifications;
