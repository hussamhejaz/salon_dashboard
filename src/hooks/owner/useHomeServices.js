// src/hooks/useHomeServices.js
import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE } from '../../config/api';
import { ToastCtx } from '../../components/ui/ToastContext';

export const useHomeServices = () => {
  const { t } = useTranslation();
  const { pushToast } = useContext(ToastCtx);
  
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch all home services and categories
  const fetchHomeServices = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/home-services`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok) {
        setServices(data.services || []);
        setCategories(data.categories || []);
      } else {
        throw new Error(data.error || t('common.error', 'Failed to load home services'));
      }
    } catch (err) {
      const errorMessage = err.message || t('common.error', 'Error loading home services');
      setError(errorMessage);
      pushToast({
        type: 'error',
        title: t('common.error', 'Error'),
        desc: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch available categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/home-services/categories/available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.ok) {
        setCategories(data.categories || []);
        return data.categories;
      } else {
        throw new Error(data.error || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      return [];
    }
  };

  // Create new home service
  const createHomeService = async (serviceData) => {
    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/home-services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.ok) {
        setServices(prev => [data.service, ...prev]);
        pushToast({
          type: 'success',
          title: t('common.success', 'Success'),
          desc: t('homeServices.created', 'Home service created successfully'),
        });
        return { success: true, service: data.service };
      } else {
        throw new Error(data.error || t('common.error', 'Failed to create home service'));
      }
    } catch (err) {
      const errorMessage = err.message || t('common.error', 'Error creating home service');
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
  };

  // Update home service
  const updateHomeService = async (serviceId, serviceData) => {
    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/home-services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.ok) {
        setServices(prev => prev.map(service => 
          service.id === serviceId ? data.service : service
        ));
        pushToast({
          type: 'success',
          title: t('common.success', 'Success'),
          desc: t('homeServices.updated', 'Home service updated successfully'),
        });
        return { success: true, service: data.service };
      } else {
        throw new Error(data.error || t('common.error', 'Failed to update home service'));
      }
    } catch (err) {
      const errorMessage = err.message || t('common.error', 'Error updating home service');
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
  };

  // Delete home service
  const deleteHomeService = async (serviceId) => {
    try {
      setSaving(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE}/api/owner/home-services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.ok) {
        setServices(prev => prev.filter(service => service.id !== serviceId));
        pushToast({
          type: 'success',
          title: t('common.success', 'Success'),
          desc: t('homeServices.deleted', 'Home service deleted successfully'),
        });
        return { success: true };
      } else {
        throw new Error(data.error || t('common.error', 'Failed to delete home service'));
      }
    } catch (err) {
      const errorMessage = err.message || t('common.error', 'Error deleting home service');
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
  };

  // Toggle service active status
  const toggleServiceStatus = async (serviceId, currentStatus) => {
    return await updateHomeService(serviceId, { is_active: !currentStatus });
  };

  useEffect(() => {
    fetchHomeServices();
  }, []);

  return {
    // State
    services,
    categories,
    loading,
    saving,
    error,
    
    // Actions
    fetchHomeServices,
    fetchCategories,
    createHomeService,
    updateHomeService,
    deleteHomeService,
    toggleServiceStatus,
    
    // Utilities
    refetch: fetchHomeServices,
  };
};