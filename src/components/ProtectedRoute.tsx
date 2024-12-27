import { Navigate, useLocation } from 'react-router-dom';

const SESSION_KEY = 'auth-storage';
const SESSION_DURATION = 10 * 60 * 1000; // 10 minutes en millisecondes

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const checkSession = () => {
    const authData = localStorage.getItem(SESSION_KEY);
    if (!authData) return false;

    try {
      const data = JSON.parse(authData);
      if (!data.state?.token || !data.state?.timestamp) return false;

      const expirationTime = new Date(data.state.timestamp + SESSION_DURATION);
      if (new Date() > expirationTime) {
        localStorage.removeItem(SESSION_KEY);
        return false;
      }

      // Renouveler le timestamp
      data.state.timestamp = new Date().getTime();
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
  };

  if (!checkSession()) {
    // Rediriger vers la page de login en conservant l'URL de destination
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}; 