import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import { ToastCtx } from '../../components/ui/ToastContext';

// Fetch and manage owner clients list with pagination and search.
export const useOwnerClients = ({ initialPage = 1, initialLimit = 10, initialSearch = '' } = {}) => {
  const { t } = useTranslation();
  const { pushToast } = useContext(ToastCtx);

  const [clients, setClients] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = useCallback(
    async (params = {}) => {
      const page = params.page ?? pagination.page;
      const limit = params.limit ?? pagination.limit;
      const term = params.search ?? search;

      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('auth_token');
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (term) queryParams.append('search', term);

        const response = await fetch(`${API_BASE}/api/owner/clients?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(
            data?.error ||
              data?.details ||
              t('clients.errors.fetchFailed', 'Failed to load clients') // i18n key: clients.errors.fetchFailed
          );
        }

        setClients(data.clients || []);
        setPagination({
          page: data.pagination?.page || page,
          limit: data.pagination?.limit || limit,
          total: data.pagination?.total || data.clients?.length || 0,
          pages: data.pagination?.pages || 0,
        });
      } catch (err) {
        const message =
          err.message || t('clients.errors.fetchFailed', 'Failed to load clients'); // i18n key: clients.errors.fetchFailed
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
    [pagination.page, pagination.limit, search, t, pushToast]
  );

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetch = useCallback(
    (opts = {}) => fetchClients(opts),
    [fetchClients]
  );

  const controls = useMemo(
    () => ({
      setPage: (page) => setPagination((prev) => ({ ...prev, page })),
      setLimit: (limit) => setPagination((prev) => ({ ...prev, limit })),
      setSearch,
    }),
    []
  );

  return {
    clients,
    pagination,
    loading,
    error,
    search,
    refetch,
    ...controls,
  };
};

export default useOwnerClients;
