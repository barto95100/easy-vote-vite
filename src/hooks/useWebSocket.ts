import { useEffect, useRef, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  pollId?: string;
  data?: any;
}

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      // Construire l'URL WebSocket en utilisant l'URL actuelle
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws`;

      console.log('Tentative de connexion WebSocket à:', wsUrl);
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connecté');
        options.onConnect?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          options.onMessage?.(data);
        } catch (error) {
          console.error('Erreur lors du parsing du message WebSocket:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        options.onError?.(error);
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket déconnecté, tentative de reconnexion...');
        options.onDisconnect?.();
        
        // Tentative de reconnexion après 5 secondes
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };
    } catch (error) {
      console.error('Erreur lors de la connexion WebSocket:', error);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, [options]);

  // Envoyer un message
  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket non connecté, impossible d\'envoyer le message');
    }
  }, []);

  // Connexion initiale
  useEffect(() => {
    connect();

    // Nettoyage à la déconnexion
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    sendMessage,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
}; 