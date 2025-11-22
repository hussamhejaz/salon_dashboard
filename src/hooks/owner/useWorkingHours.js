import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';

// Helper function to get the owner token
const getOwnerToken = () => {
  // Check for different possible token storage keys
  const token = localStorage.getItem('ownerToken') || 
               localStorage.getItem('token') ||
               localStorage.getItem('authToken') ||
               localStorage.getItem('salonToken');
  
  console.log('🔐 [AUTH] Token found:', token ? 'YES' : 'NO');
  return token;
};

// Helper function to check if user is authenticated
const checkAuth = () => {
  const token = getOwnerToken();
  if (!token) {
    throw new Error('Authentication required. Please log in as salon owner.');
  }
  return token;
};

export function useOwnerWorkingHours() {
  const [workingHours, setWorkingHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = checkAuth();
      setIsAuthenticated(true);

      console.log('📋 [OWNER] Fetching working hours...');

      const response = await fetch(`${API_BASE}/api/owner/working-hours`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [OWNER] Fetch failed:', data);
        
        if (response.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('ownerToken');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(data.error || `Failed to fetch working hours: ${response.status}`);
      }

      if (data.ok) {
        console.log('✅ [OWNER] Working hours fetched:', data.workingHours?.length);
        setWorkingHours(data.workingHours || []);
      } else {
        throw new Error(data.error || 'Unknown error from server');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ [OWNER] Error fetching working hours:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateWorkingHours = async (newWorkingHours, timezone = "Asia/Riyadh") => {
    try {
      setUpdating(true);
      setError(null);

      const token = checkAuth();

      console.log('🔄 [OWNER] Sending update request:', { 
        workingHoursCount: newWorkingHours?.length,
        timezone 
      });

      const response = await fetch(`${API_BASE}/api/owner/working-hours`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workingHours: newWorkingHours,
          timezone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [OWNER] Update failed:', data);
        
        if (response.status === 401) {
          localStorage.removeItem('ownerToken');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(data.error || `Update failed: ${response.status}`);
      }

      if (data.ok) {
        console.log('✅ [OWNER] Working hours updated successfully');
        setWorkingHours(data.workingHours || newWorkingHours);
        return { success: true, data: data.workingHours };
      } else {
        throw new Error(data.error || 'Update failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ [OWNER] Error updating working hours:', err);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  const resetToDefault = async () => {
    try {
      setUpdating(true);
      setError(null);

      const token = checkAuth();

      console.log('🔄 [OWNER] Resetting to default working hours...');

      const response = await fetch(`${API_BASE}/api/owner/working-hours/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('❌ [OWNER] Reset failed:', data);
        
        if (response.status === 401) {
          localStorage.removeItem('ownerToken');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(data.error || `Reset failed: ${response.status}`);
      }

      if (data.ok) {
        console.log('✅ [OWNER] Working hours reset to default');
        setWorkingHours(data.workingHours || []);
        return { success: true, data: data.workingHours };
      } else {
        throw new Error(data.error || 'Reset failed');
      }
    } catch (err) {
      setError(err.message);
      console.error('❌ [OWNER] Error resetting working hours:', err);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  return {
    workingHours,
    loading,
    error,
    updating,
    isAuthenticated,
    updateWorkingHours,
    resetToDefault,
    refetch: fetchWorkingHours
  };
}