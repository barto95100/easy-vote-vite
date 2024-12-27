import { WebSocket, WebSocketServer } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer;
const clients = new Set<WebSocket>();

export const initWebSocket = (server: Server) => {
  wss = new WebSocketServer({
    server,
    path: '/',
    perMessageDeflate: false,
    verifyClient: (info, callback) => {
      // En développement, tout accepter
      if (process.env.NODE_ENV === 'development') {
        callback(true);
        return;
      }

      // En production, vérifier l'origine
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
      callback(allowedOrigins.includes(info.origin));
    }
  });

  wss.on('connection', (ws, req) => {
    const clientIp = req.headers['x-real-ip'] || req.socket.remoteAddress;
    const origin = req.headers.origin;
    
    console.log('📡 Nouvelle connexion WebSocket:', {
      client: clientIp,
      origin
    });

    clients.add(ws);

    ws.on('error', (error) => {
      if (error.message.includes('invalid status code 1006')) {
        // Ignorer cette erreur spécifique
        return;
      }
      console.error('Erreur WebSocket:', error);
    });

    ws.on('close', (code) => {
      clients.delete(ws);
      if (code !== 1000 && code !== 1001 && code !== 1006) {
        // Ne logger que les codes de fermeture anormaux
        console.log('WebSocket fermé:', { code });
      }
    });
  });
};

export const broadcastPollUpdate = (pollId: string, type: string, data: any = {}) => {
  if (!wss) {
    console.error('WebSocket server not initialized');
    return;
  }

  const message = JSON.stringify({
    type,
    pollId,
    ...data,
    timestamp: new Date().toISOString()
  });

  console.log(`Broadcasting ${type} event for poll ${pollId}:`, data);

  let clientCount = 0;
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      clientCount++;
    }
  });

  console.log(`Message broadcast to ${clientCount} clients`);
}; 