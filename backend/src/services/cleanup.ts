import { PrismaClient } from '@prisma/client';
import { broadcastPollUpdate } from '../websocket';

const prisma = new PrismaClient();

export class CleanupService {
  static async cleanupExpiredPolls() {
    try {
      const now = new Date();
      
      // Récupérer les sondages expirés non fermés
      const expiredPolls = await prisma.poll.findMany({
        where: {
          expiresAt: {
            lte: now
          },
          isClosed: false
        }
      });

      // Marquer chaque sondage comme fermé
      for (const poll of expiredPolls) {
        await prisma.poll.update({
          where: { id: poll.id },
          data: { isClosed: true }
        });

        // Broadcast de la fermeture
        try {
          broadcastPollUpdate(poll.id, 'CLOSED', {
            pollId: poll.id,
            poll: {
              ...poll,
              isClosed: true
            }
          });
        } catch (error) {
          console.error(`Erreur lors du broadcast pour le sondage ${poll.id}:`, error);
        }
      }

      console.log(`${expiredPolls.length} sondages expirés ont été fermés`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des sondages expirés:', error);
    }
  }

  static startCleanupJob() {
    // Vérifier toutes les minutes
    setInterval(() => {
      this.cleanupExpiredPolls();
    }, 60 * 1000);
  }
} 