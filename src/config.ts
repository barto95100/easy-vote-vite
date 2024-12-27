const isDev = import.meta.env.DEV;
const apiUrl = import.meta.env.VITE_API_URL;
const wsUrl = import.meta.env.VITE_WS_URL;

export const config = {
  API_URL: isDev ? '' : apiUrl,
  WS_URL: isDev 
    ? `ws://${window.location.hostname}:${import.meta.env.VITE_PORT || '3001'}/ws`
    : `${wsUrl}/ws`,
}; 