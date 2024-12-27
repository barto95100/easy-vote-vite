export const handleAuthError = (error: unknown) => {
  if (error instanceof Response && error.status === 401) {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin';
    return 'Session expirée';
  }
  return error instanceof Error ? error.message : 'Une erreur est survenue';
}; 