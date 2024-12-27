'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import Card from './Card';
import type { Poll } from '../types';
import { PlusIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import PageHeader from './PageHeader';

declare global {
  interface WebSocket {
    closeInitiated?: boolean;
  }
}

const PollList = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPolls = async () => {
    try {
      const data = await api.getPolls();
      setPolls(data);
    } catch (err) {
      console.error('Erreur lors du chargement des sondages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Charger les sondages initialement
  useEffect(() => {
    refreshPolls();
  }, []);

  // Configurer WebSocket pour les mises à jour en temps réel
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout;

    const connect = () => {
      try {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsHost = window.location.host;
        const wsUrl = `${wsProtocol}//${wsHost}/ws`;
        
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('WebSocket connecté');
          // Démarrer le ping une fois connecté
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'PING' }));
            }
          }, 30000);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Message WebSocket reçu:', data);
            
            switch (data.type) {
              case 'UPDATE':
                // Nouveau sondage créé ou mise à jour générale
                refreshPolls();
                break;
                
              case 'VOTE':
                // Mise à jour du nombre de votes
                setPolls(currentPolls => 
                  currentPolls.map(poll => 
                    poll.id === data.pollId 
                      ? { ...poll, totalVotes: data.totalVotes }
                      : poll
                  )
                );
                break;
                
              case 'CLOSED':
                // Sondage fermé
                setPolls(currentPolls => 
                  currentPolls.map(poll => 
                    poll.id === data.pollId 
                      ? { ...poll, isClosed: true }
                      : poll
                  )
                );
                break;
                
              case 'DELETED':
                // Sondage supprimé
                setPolls(currentPolls => 
                  currentPolls.filter(poll => poll.id !== data.pollId)
                );
                break;
            }
          } catch (error) {
            console.error('Erreur parsing message WebSocket:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          // Ne pas tenter de reconnecter si la fermeture est volontaire
          if (!ws.closeInitiated) {
            console.log('WebSocket déconnecté, tentative de reconnexion...');
            reconnectTimeout = setTimeout(connect, 1000);
          }
        };
      } catch (error) {
        console.error('Erreur WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.closeInitiated = true;
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };
  }, []);

  // Vérifier périodiquement les sondages expirés
  useEffect(() => {
    const checkExpirations = () => {
      setPolls(currentPolls => 
        currentPolls.map(poll => {
          const isExpired = new Date(poll.expiresAt) <= new Date();
          if (isExpired && !poll.isClosed) {
            return { ...poll, isClosed: true };
          }
          return poll;
        })
      );
    };

    const interval = setInterval(checkExpirations, 1000);
    return () => clearInterval(interval);
  }, []);

  const isPollActive = (poll: Poll) => {
    const now = new Date();
    const expirationDate = new Date(poll.expiresAt);
    return !poll.isClosed && expirationDate > now;
  };

  // Fonction pour formater le temps restant
  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diff = expiration.getTime() - now.getTime();

    if (diff <= 0) return 'Expiré';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}j ${hours}h restants`;
    if (hours > 0) return `${hours}h ${minutes}m restants`;
    if (minutes > 0) return `${minutes}m restants`;
    if (seconds > 0) return `${seconds} secondes restantes`;
    return 'Expiration imminente';
  };

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <PageHeader
          icon={<ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600" />}
          title="Retrouvez ici tous vos sondages !"
          description="Accédez à la liste complète de vos sondages, consultez leur statut, et gérez-les facilement. Qu’ils soient en cours, terminés ou à venir, tout est centralisé pour un suivi optimal."
        />
      </Card>

      {polls.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Link key={poll.id} to={`/polls/${poll.id}`}>
              <Card className="h-full bg-gradient-to-b from-indigo-50 via-white to-white shadow-sm hover:shadow-lg transition-all duration-200">
                <div className="p-6 flex flex-col h-full">
                  {/* En-tête avec titre et statut */}
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 flex-1 pr-4">
                      {poll.title}
                    </h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      poll.isClosed || new Date(poll.expiresAt) < new Date()
                        ? 'bg-red-100 text-red-800'  // Rouge pour "Terminé"
                        : 'bg-green-100 text-green-800'  // Vert pour "En cours"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        poll.isClosed || new Date(poll.expiresAt) < new Date()
                          ? 'bg-red-400'  // Point rouge pour "Terminé"
                          : 'bg-green-400'  // Point vert pour "En cours"
                      }`} />
                      {poll.isClosed || new Date(poll.expiresAt) < new Date() ? 'Terminé' : 'En cours'}
                    </span>
                  </div>

                  {/* Temps restant */}
                  {!poll.isClosed && (
                    <div className="text-sm text-indigo-600 font-medium mb-2">
                      {getTimeRemaining(poll.expiresAt)}
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-600 line-clamp-2 mb-auto">
                    {poll.description}
                  </p>

                  {/* Pied de vignette avec infos */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>
                        {poll.createdAt && `Créé le ${new Date(poll.createdAt).toLocaleDateString()}`}
                      </span>
                      <span className="font-medium text-indigo-600">
                        {typeof poll.totalVotes === 'number' ? 
                          `${poll.totalVotes} vote${poll.totalVotes !== 1 ? 's' : ''}` :
                          `${poll.options.reduce((sum, opt) => sum + opt.votes, 0)} vote(s)`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-gradient-to-b from-gray-50 to-white p-8 text-center">
          <div className="max-w-md mx-auto">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun sondage disponible</h3>
            <p className="mt-1 text-gray-500">Commencez par créer votre premier sondage !</p>
            <div className="mt-6">
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Créer un sondage
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PollList;
