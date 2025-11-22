import { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE}/api/owner/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.ok) {
        setProfile(data.profile);
      } else {
        setError(data.error || 'Failed to load profile');
      }
    } catch (err) {
      setError('Network error: Failed to load profile' , err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (email) => {
    try {
      setError('');
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE}/api/owner/profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.ok) {
        setProfile(prev => ({
          ...prev,
          user: { ...prev.user, email }
        }));
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
    } catch (err) {
      return { success: false, error: 'Network error: Failed to update profile' , err };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError('');
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE}/api/owner/profile/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (data.ok) {
        return { success: true, message: 'Password changed successfully' };
      } else {
        return { success: false, error: data.error || 'Failed to change password' };
      }
    } catch (err) {
      return { success: false, error: 'Network error: Failed to change password' ,err };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    changePassword,
  };
};