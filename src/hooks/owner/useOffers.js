// hooks/useOffers.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';

export const useOffers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  
  const { user, logout, isAuthenticated } = useAuth();

  // Base API configuration
  const OFFERS_API_BASE = `${API_BASE}/api/owner/offers`;

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const handleApiError = useCallback((error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    
    // Handle authentication errors
    if (error.error === 'UNAUTHORIZED' || error.error === 'INVALID_TOKEN') {
      logout();
      return { 
        ok: false, 
        error: 'Your session has expired. Please log in again.',
        requiresAuth: true 
      };
    }
    
    const errorMessage = error.details || error.error || defaultMessage;
    setError(errorMessage);
    return { ok: false, error: errorMessage };
  }, [logout]);

  const clearError = () => setError(null);

  // Check if user is authenticated before making API calls
  const checkAuth = useCallback(() => {
    if (!isAuthenticated() || !user) {
      setError('Please log in to manage offers');
      return false;
    }
    return true;
  }, [isAuthenticated, user]);

  // Fetch all offers
  const fetchOffers = useCallback(async () => {
    if (!checkAuth()) return;

    setLoading(true);
    clearError();
    
    try {
      const response = await fetch(OFFERS_API_BASE, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to fetch offers');
      }

      setOffers(result.offers || []);
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while fetching offers');
    } finally {
      setLoading(false);
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout]);

  // Fetch single offer by ID
  const fetchOfferById = useCallback(async (offerId) => {
    if (!checkAuth()) return;
    
    if (!offerId) {
      return handleApiError({ error: 'Offer ID is required' });
    }

    setLoading(true);
    clearError();

    try {
      const response = await fetch(`${OFFERS_API_BASE}/${offerId}`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to fetch offer');
      }

      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while fetching offer');
    } finally {
      setLoading(false);
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout]);

  // Fetch offers statistics
  const fetchOffersStats = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      const response = await fetch(`${OFFERS_API_BASE}/stats/summary`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to fetch statistics');
      }

      setStats(result.stats || {});
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while fetching statistics');
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout]);

  // Fetch offer categories
  const fetchOfferCategories = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      const response = await fetch(`${OFFERS_API_BASE}/categories`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to fetch categories');
      }

      setCategories(result.categories || []);
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while fetching categories');
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout]);

  // Fetch salon services (for linking offers)
  const fetchServices = useCallback(async () => {
    if (!checkAuth()) return;

    setServicesLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/owner/services`, {
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to fetch services');
      }

      setServices(result.services || []);
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while fetching services');
    } finally {
      setServicesLoading(false);
    }
  }, [checkAuth, getAuthHeaders, handleApiError, logout]);

  // Create new offer
  const createOffer = useCallback(async (offerData) => {
    if (!checkAuth()) return;

    setLoading(true);
    clearError();

    try {
      const response = await fetch(OFFERS_API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(offerData),
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to create offer');
      }

      // Update local state
      setOffers(prev => [result.offer, ...prev]);
      void fetchOffersStats();
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while creating offer');
    } finally {
      setLoading(false);
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout, fetchOffersStats]);

  // Update existing offer
  const updateOffer = useCallback(async (offerId, updates) => {
    if (!checkAuth()) return;
    
    if (!offerId) {
      return handleApiError({ error: 'Offer ID is required' });
    }

    setLoading(true);
    clearError();

    try {
      const response = await fetch(`${OFFERS_API_BASE}/${offerId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(updates),
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to update offer');
      }

      // Update local state
      setOffers(prev => 
        prev.map(offer => 
          offer.id === offerId ? result.offer : offer
        )
      );
      void fetchOffersStats();
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while updating offer');
    } finally {
      setLoading(false);
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout, fetchOffersStats]);

  // Delete offer
  const deleteOffer = useCallback(async (offerId) => {
    if (!checkAuth()) return;
    
    if (!offerId) {
      return handleApiError({ error: 'Offer ID is required' });
    }

    setLoading(true);
    clearError();

    try {
      const response = await fetch(`${OFFERS_API_BASE}/${offerId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      if (response.status === 401) {
        logout();
        return handleApiError({ error: 'UNAUTHORIZED' });
      }

      const result = await response.json();

      if (!result.ok) {
        return handleApiError(result, 'Failed to delete offer');
      }

      // Update local state
      setOffers(prev => prev.filter(offer => offer.id !== offerId));
      void fetchOffersStats();
      return result;
    } catch (err) {
      return handleApiError(err, 'Network error while deleting offer');
    } finally {
      setLoading(false);
    }
  }, [OFFERS_API_BASE, checkAuth, getAuthHeaders, handleApiError, logout, fetchOffersStats]);

  // Toggle offer active status
  const toggleOfferActive = useCallback(async (offerId, currentStatus) => {
    return updateOffer(offerId, { is_active: !currentStatus });
  }, [updateOffer]);

  // Calculate offer status based on dates and active flag
  const getOfferStatus = useCallback((offer) => {
    if (!offer.is_active) return 'inactive';
    
    const now = new Date();
    const startDate = new Date(offer.start_date);
    const endDate = new Date(offer.end_date);
    
    if (now < startDate) return 'scheduled';
    if (now > endDate) return 'expired';
    return 'active';
  }, []);

  // Filter offers by status
  const getOffersByStatus = useCallback((status) => {
    return offers.filter(offer => getOfferStatus(offer) === status);
  }, [offers, getOfferStatus]);

  // Search offers by title or description
  const searchOffers = useCallback((query) => {
    if (!query) return offers;
    
    const lowerQuery = query.toLowerCase();
    return offers.filter(offer => 
      offer.title.toLowerCase().includes(lowerQuery) ||
      (offer.description && offer.description.toLowerCase().includes(lowerQuery)) ||
      (offer.category && offer.category.toLowerCase().includes(lowerQuery))
    );
  }, [offers]);

  // Filter offers by category
  const filterOffersByCategory = useCallback((category) => {
    if (!category) return offers;
    return offers.filter(offer => offer.category === category);
  }, [offers]);

  // Refresh all offer data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchOffers(),
      fetchOffersStats(),
      fetchOfferCategories(),
      fetchServices()
    ]);
  }, [fetchOffers, fetchOffersStats, fetchOfferCategories, fetchServices]);

  // Initialize with offers and categories
  useEffect(() => {
    if (user && isAuthenticated()) {
      fetchOffers();
      fetchOffersStats();
      fetchOfferCategories();
      fetchServices();
    }
  }, [
    user,
    isAuthenticated,
    fetchOffers,
    fetchOffersStats,
    fetchOfferCategories,
    fetchServices,
  ]);

  return {
    // State
    offers,
    loading,
    error,
    stats,
    categories,
    services,
    servicesLoading,
    
    // Actions
    fetchOffers,
    fetchOfferById,
    createOffer,
    updateOffer,
    deleteOffer,
    fetchOffersStats,
    fetchOfferCategories,
    fetchServices,
    toggleOfferActive,
    refreshAll,
    
    // Utilities
    getOfferStatus,
    getOffersByStatus,
    searchOffers,
    filterOffersByCategory,
    clearError,
    
    // Computed values
    activeOffers: getOffersByStatus('active'),
    expiredOffers: getOffersByStatus('expired'),
    scheduledOffers: getOffersByStatus('scheduled'),
    inactiveOffers: getOffersByStatus('inactive'),
    
    // User info
    salonId: user?.salon_id,
    isOwner: !!user?.salon_id,
  };
};

// Custom hook for offer form management
export const useOfferForm = (existingOffer = null) => {
  const [formData, setFormData] = useState({
    title: existingOffer?.title || '',
    description: existingOffer?.description || '',
    category: existingOffer?.category || '',
    service_id: existingOffer?.service_id || '',
    discount_percentage: existingOffer?.discount_percentage || '',
    discount_amount: existingOffer?.discount_amount || '',
    original_price: existingOffer?.original_price || '',
    final_price: existingOffer?.final_price || '',
    start_date: existingOffer?.start_date || '',
    end_date: existingOffer?.end_date || '',
    image_url: existingOffer?.image_url || '',
    terms_conditions: existingOffer?.terms_conditions || '',
    max_uses: existingOffer?.max_uses || '',
    is_active: existingOffer?.is_active ?? true,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateField = useCallback((field, value) => {
    const fieldErrors = {};
    
    switch (field) {
      case 'title':
        if (!value.trim()) fieldErrors.title = 'Title is required';
        break;
      case 'start_date':
        if (!value) fieldErrors.start_date = 'Start date is required';
        break;
      case 'end_date':
        if (!value) fieldErrors.end_date = 'End date is required';
        break;
      case 'discount_percentage':
        if (value && (value < 0 || value > 100)) {
          fieldErrors.discount_percentage = 'Discount percentage must be between 0 and 100';
        }
        break;
      case 'discount_amount':
        if (value && value < 0) {
          fieldErrors.discount_amount = 'Discount amount cannot be negative';
        }
        break;
      case 'original_price':
        if (value && value < 0) {
          fieldErrors.original_price = 'Original price cannot be negative';
        }
        break;
      case 'final_price':
        if (value && value < 0) {
          fieldErrors.final_price = 'Final price cannot be negative';
        }
        break;
      case 'max_uses':
        if (value && value < 0) {
          fieldErrors.max_uses = 'Max uses cannot be negative';
        }
        break;
      case 'service_id':
        if (!value) {
          fieldErrors.service_id = 'Please select a service';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, ...fieldErrors }));
    return Object.keys(fieldErrors).length === 0;
  }, []);

  const validateForm = useCallback((options = {}) => {
    const newErrors = {};
    const { requireService = false, serviceErrorMessage = 'Please select a service' } = options;
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    
    // Date validation
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate <= startDate) {
        newErrors.end_date = 'End date must be after start date';
      }
    }
    
    // Pricing validation
    if (formData.discount_percentage && formData.discount_amount) {
      newErrors.discount_percentage = 'Cannot have both discount percentage and amount';
      newErrors.discount_amount = 'Cannot have both discount percentage and amount';
    }
    
    if (requireService && !formData.service_id) {
      newErrors.service_id = serviceErrorMessage;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      category: '',
      service_id: '',
      discount_percentage: '',
      discount_amount: '',
      original_price: '',
      final_price: '',
      start_date: '',
      end_date: '',
      image_url: '',
      terms_conditions: '',
      max_uses: '',
      is_active: true,
    });
    setErrors({});
    setTouched({});
  }, []);

  // Auto-calculate final price when pricing fields change
  useEffect(() => {
    if (formData.original_price && (formData.discount_percentage || formData.discount_amount)) {
      let calculatedPrice = parseFloat(formData.original_price);
      
      if (formData.discount_percentage) {
        calculatedPrice = calculatedPrice * (1 - parseFloat(formData.discount_percentage) / 100);
      } else if (formData.discount_amount) {
        calculatedPrice = calculatedPrice - parseFloat(formData.discount_amount);
      }
      
      // Only update if the user hasn't manually set a final price
      if (!touched.final_price) {
        updateField('final_price', Math.max(0, calculatedPrice).toFixed(2));
      }
    }
  }, [
    formData.original_price, 
    formData.discount_percentage, 
    formData.discount_amount, 
    touched.final_price,
    updateField
  ]);

  return {
    formData,
    errors,
    touched,
    updateField,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFormData,
  };
};
