import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const SESSION_KEY = 'auth-storage';
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes en millisecondes

export const useSession = () => {
  const navigate = useNavigate();

  const refreshSession = useCallback(() => {
    const authData = localStorage.getItem(SESSION_KEY);
    if (!authData) return;

    try {
      const data = JSON.parse(authData);
      // Vérifier si le timestamp existe, sinon l'ajouter
      if (!data.state.timestamp) {
        data.state.timestamp = new Date().getTime();
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        return;
      }

      const expirationTime = new Date(data.state.timestamp + SESSION_DURATION);
      
      if (new Date() > expirationTime) {
        // Session expirée
        console.log('Session expirée');
        localStorage.removeItem(SESSION_KEY);
        navigate('/admin/login');
      } else {
        // Renouveler le timestamp
        data.state.timestamp = new Date().getTime();
        localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      localStorage.removeItem(SESSION_KEY);
      navigate('/admin/login');
    }
  }, [navigate]);

  // Vérifier la session au montage du composant
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // Vérifier la session toutes les minutes
  useEffect(() => {
    const interval = setInterval(refreshSession, 60000);
    return () => clearInterval(interval);
  }, [refreshSession]);

  // Rafraîchir la session à chaque action
  useEffect(() => {
    const handleActivity = () => refreshSession();
    window.addEventListener('click', handleActivity);
    window.addEventListener('keypress', handleActivity);
    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keypress', handleActivity);
    };
  }, [refreshSession]);

  return { refreshSession };
}; 