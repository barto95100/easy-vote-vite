import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

export const useAuthFetch = () => {
  const { logout } = useAdmin();
  const navigate = useNavigate();

  const authFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      logout();
      navigate('/admin');
      throw new Error('Non authentifié');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      logout();
      navigate('/admin');
      throw new Error('Session expirée');
    }

    return response;
  }, [logout, navigate]);

  return authFetch;
}; 