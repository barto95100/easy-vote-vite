'use client';

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import type { Poll } from '../types'
import DeletePollButton from './DeletePollButton'
import StopPollButton from './StopPollButton'
import Card from './Card'
import SharePollButton from './SharePollButton'
import { useWebSocket } from '../hooks/useWebSocket'
import PollChart from './PollChart'
import { getBrowserId } from '../utils/browserIdentifier'
import { ClockIcon } from '@heroicons/react/24/outline'

interface CustomWebSocket extends WebSocket {
  closeInitiated?: boolean;
}

const PollDetail = () => {
  const { id } = useParams()
  const [poll, setPoll] = useState<Poll | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const navigate = useNavigate()
  const [showStopModal, setShowStopModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userVote, setUserVote] = useState<string | null>(null)
  const [isPrivate, setIsPrivate] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [tokenHasVoted, setTokenHasVoted] = useState(false);

  const fetchPoll = async () => {
    if (!id) return
    try {
      const data = await api.getPoll(id)
      setPoll(data)
      const savedVote = localStorage.getItem(`poll_vote_${id}`)
      if (savedVote) {
        setHasVoted(true)
        setUserVote(savedVote)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPoll()
  }, [id])

  useEffect(() => {
    const checkVoteAccess = async () => {
      if (!poll) return;

      if (!poll.isPrivate) {
        setCanVote(true);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (!token) {
        setCanVote(false);
        return;
      }

      try {
        const response = await fetch(`/api/polls/${id}/verify-token?token=${token}`);
        const data = await response.json();
        setCanVote(data.isValid);
        setTokenHasVoted(data.hasVoted);
        if (data.hasVoted) {
          setHasVoted(true);
        }
      } catch (error) {
        setCanVote(false);
      }
    };

    checkVoteAccess();
  }, [poll]);

  const handleVote = async (optionId: string) => {
    if (!poll || isVoting || !id || hasVoted) return;

    setIsVoting(true);
    setError(null);

    try {
      const fingerprint = getBrowserId(id);
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      await api.votePoll(id, {
        optionId,
        fingerprint,
        token
      });
      
      // Rafraîchir les données du sondage
      const updatedPoll = await api.getPoll(id);
      setPoll(updatedPoll);
      
      setSuccess('Votre vote a bien été enregistré !');
      setHasVoted(true);
      setUserVote(optionId);
      localStorage.setItem(`poll_vote_${id}`, optionId);
    } catch (err) {
      console.error('Erreur lors du vote:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleStop = async (password: string) => {
    try {
      setError(null);
      await api.closePoll(id, password);
      setSuccess('Le sondage a été arrêté');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la fermeture du sondage');
    }
  };

  const handleDelete = async (password: string) => {
    try {
      setError(null);
      await api.deletePoll(id!, password);
      // Fermer la connexion WebSocket avant la redirection
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du sondage');
    }
  };

  const handlePollStop = () => {
    if (id) {
      fetchPoll()
    }
  }

  // Vérifier si le sondage est terminé (expiré ou fermé manuellement)
  const isPollEnded = () => {
    if (!poll) return false;
    const isExpired = new Date(poll.expiresAt) < new Date();
    return isExpired || poll.isClosed;
  };

  // Utiliser cette fonction pour déterminer si on affiche les résultats
  useEffect(() => {
    if (poll && isPollEnded()) {
      setHasVoted(true);
    }
  }, [poll]);

  // Fonction pour formater le temps restant
  const getRemainingTime = (expiresAt: Date): string => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    // Convertir en unités de temps
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}j ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else if (minutes > 0) {
      return `${minutes}min`;
    } else {
      return 'moins d\'1min';
    }
  };

  // couter les mises à jour WebSocket
  useEffect(() => {
    if (!id) return;

    let ws: CustomWebSocket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 1000; // 1 seconde

    const connectWebSocket = () => {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.host;
      const wsUrl = `${wsProtocol}//${wsHost}/ws`;
      
      ws = new WebSocket(wsUrl) as CustomWebSocket;

      ws.onopen = () => {
        console.log('WebSocket connecté pour le sondage:', id);
        reconnectAttempts = 0;
      };

      ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
        if (!ws.closeInitiated) {
          setTimeout(connectWebSocket, 1000);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket déconnecté, code:', event.code);
        if (event.code === 1006) {
          setTimeout(connectWebSocket, 1000);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Message WebSocket reçu:', data);
          
          if (data.pollId !== id) {
            console.log('Message ignoré - ID différent');
            return;
          }

          if (data.type === 'DELETED' && data.pollId === id) {
            // Fermer proprement la connexion avant la redirection
            ws.close();
            navigate('/');
            return;
          }

          switch (data.type) {
            case 'VOTE':
              // Mettre à jour le sondage avec les nouvelles données
              setPoll(currentPoll => {
                if (!currentPoll) return null;
                
                // Mettre à jour les options avec les nouveaux votes
                const updatedOptions = currentPoll.options.map(option => {
                  const updatedOption = data.options.find((opt: any) => opt.id === option.id);
                  return updatedOption || option;
                });

                return {
                  ...currentPoll,
                  options: updatedOptions,
                  totalVotes: data.totalVotes
                };
              });

              // Afficher une notification de nouveau vote
              if (data.lastVote && data.lastVote.optionId !== userVote) {
                setSuccess('Nouveau vote enregistré !');
                setTimeout(() => setSuccess(null), 3000);
              }
              break;
            
            case 'CLOSED':
              console.log('Traitement de l\'événement CLOSED:', data);
              // Mise à jour immédiate du sondage avec toutes les données
              setPoll(currentPoll => {
                if (!currentPoll) {
                  console.log('Pas de sondage courant');
                  return null;
                }
                
                const updatedPoll = {
                  ...currentPoll,
                  ...data.poll,
                  isClosed: true,
                  options: data.poll.options.map(opt => ({
                    ...opt,
                    votes: opt.votes || 0
                  })),
                  totalVotes: data.poll.totalVotes || data.poll._count.votes
                };
                console.log('Nouveau état du sondage:', updatedPoll);
                return updatedPoll;
              });
              
              // Forcer l'affichage des résultats
              setHasVoted(true);
              console.log('Résultats forcés à afficher');
              
              // Notification
              setSuccess('Le sondage a té arrêté');
              setTimeout(() => setSuccess(null), 3000);
              break;
            
            case 'DELETED':
              console.log('Sondage supprimé, redirection...');
              navigate('/');
              break;

            default:
              console.log('Type d\'événement non géré:', data.type);
          }
        } catch (error) {
          console.error('Erreur lors du traitement du message WebSocket:', error);
        }
      };
    };

    connectWebSocket();

    return () => {
      if (ws?.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [id, userVote, navigate]);

  // Vérifier périodiquement si le sondage est expiré
  useEffect(() => {
    if (!poll) return;

    const checkExpiration = () => {
      const now = new Date();
      const expirationDate = new Date(poll.expiresAt);
      
      if (now >= expirationDate && !poll.isClosed) {
        fetchPoll(); // Rafraîchir si le sondage vient d'expirer
      }
    };

    const interval = setInterval(checkExpiration, 1000);
    return () => clearInterval(interval);
  }, [poll]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <div className="text-red-600 font-medium">{error}</div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Sondage non trouvé</h3>
        <div className="mt-4">
          <a
            href="/"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Retour à la liste des sondages
          </a>
        </div>
      </div>
    )
  }

  if (poll.isPrivate && !canVote && !isPollEnded()) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              {tokenHasVoted 
                ? "Vous avez déjà voté pour ce sondage avec ce lien d'invitation. Vous pouvez voir les résultats ci-dessous."
                : "Ce sondage est réservé aux personnes invitées. Vous pouvez voir les résultats mais seules les personnes ayant reçu une invitation par email peuvent voter."}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)
  const isExpired = new Date(poll.expiresAt) < new Date()

  // Ajout d'un log pour déboguer
  console.log('État actuel du sondage:', {
    isClosed: poll.isClosed,
    hasVoted: hasVoted,
    isExpired: isExpired,
    showResults: poll.isClosed || hasVoted || isExpired
  });

  return (
    <div className="max-w-5xl mx-auto">
      <Card className="bg-gradient-to-b from-indigo-100 via-indigo-50 to-white p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pb-6 border-b border-gray-100">
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 break-words">{poll.title}</h1>
              <div className="flex items-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  poll.isClosed || isExpired
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {poll.isClosed || isExpired ? 'Terminé' : 'En cours'}
                </span>
              </div>
            </div>
            {poll.description && (
              <p className="text-sm text-gray-600 mb-4 break-words">
                {poll.description}
              </p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-500 pt-2 flex-wrap">
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="whitespace-nowrap">Créé le {new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="whitespace-nowrap">{totalVotes} participant{totalVotes !== 1 ? 's' : ''}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <div className="flex items-center">
                <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="whitespace-nowrap">
                  Expire le {new Date(poll.expiresAt).toLocaleDateString()}
                  {!poll.isClosed && !isExpired && (
                    <span className="ml-2 text-indigo-600 font-medium">
                      (dans {getRemainingTime(new Date(poll.expiresAt))})
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-4 lg:mt-0 lg:ml-4">
            <SharePollButton pollId={id!} />
            
            {!isExpired && !poll.isClosed && (
              <button
                onClick={() => setShowStopModal(true)}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
                title="Arrêter le sondage"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Supprimer le sondage"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {(poll.isClosed || isExpired) ? (
          <div className="space-y-6">
            <div className={`bg-gradient-to-r ${
              poll.options.filter(o => o.votes === Math.max(...poll.options.map(o => o.votes))).length > 1
                ? 'from-yellow-50 to-white border-yellow-200'
                : 'from-emerald-50 to-white border-emerald-200'
            } border rounded-xl p-6 mb-6`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                poll.options.filter(o => o.votes === Math.max(...poll.options.map(o => o.votes))).length > 1
                  ? 'text-yellow-800'
                  : 'text-emerald-800'
              }`}>
                Voici les résultats :
              </h3>
              
              {totalVotes > 0 ? (
                <>
                  {poll.options.filter(o => o.votes === Math.max(...poll.options.map(o => o.votes))).length > 1 ? (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl" role="img" aria-label="égalité">🤦‍♂️</span>
                      <div>
                        <p className="text-yellow-800">
                          Plusieurs options sont à égalité pour la première place ...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl" role="img" aria-label="gagnant">🏆</span>
                      <div>
                        <p className="text-emerald-600">
                          {poll.options.reduce((winner, option) => 
                            option.votes > winner.votes ? option : winner
                          , poll.options[0]).text}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600">Aucun vote n'a été enregistré 😒</p>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détail des votes</h3>
              <PollChart poll={poll} />
            </div>
          </div>
        ) : hasVoted ? (
          // Message de confirmation de vote sans montrer les résultats
          <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
            <p className="text-green-800">
              Votre vote a bien été enregistré ! Les résultats seront disponibles à la fin du sondage.
            </p>
          </div>
        ) : (
          // Affichage des options de vote
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Options de vote</h2>
            {poll?.options.map((option) => {
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
              const isWinner = isExpired && totalVotes > 0 && option.votes === Math.max(...poll.options.map(o => o.votes))
              const isRunnerUp = isExpired && totalVotes > 0 && 
                option.votes === [...poll.options].sort((a, b) => b.votes - a.votes)[1]?.votes &&
                option.votes !== Math.max(...poll.options.map(o => o.votes))
              const isUserVote = option.id === userVote

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={isVoting || isExpired || hasVoted}
                  className={`
                    w-full p-6 rounded-xl border-2 transition-all duration-200
                    ${isVoting ? 'opacity-75 cursor-not-allowed' : ''}
                    ${hasVoted ? 'cursor-default' : ''}
                    ${!isExpired && !hasVoted ? 'hover:border-indigo-500 hover:shadow-md' : 'border-gray-200'}
                    ${isExpired && isWinner ? 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200' : ''}
                    ${isExpired && isRunnerUp ? 'bg-gradient-to-r from-gray-50 to-white border-gray-200' : ''}
                    ${!isExpired && isUserVote ? 'bg-gradient-to-r from-indigo-50 to-white border-indigo-200 ring-2 ring-indigo-500' : ''}
                    ${isExpired && !isWinner && !isRunnerUp && option.votes > 0 ? 'bg-gradient-to-r from-indigo-50 to-white' : 'bg-white'}
                  `}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 text-lg">{option.text}</span>
                        {!isExpired && isUserVote && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Votre choix
                          </span>
                        )}
                        {isExpired && isWinner && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Choix gagnant
                          </span>
                        )}
                        {isExpired && isRunnerUp && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            2ème place
                          </span>
                        )}
                      </div>
                      {isExpired && (
                        <div className="flex items-center space-x-3">
                          <span className="text-base text-gray-500">{option.votes} vote{option.votes !== 1 ? 's' : ''}</span>
                          <span className={`text-base font-medium ${
                            isWinner ? 'text-emerald-600' : 
                            isRunnerUp ? 'text-gray-600' : 
                            'text-indigo-600'
                          }`}>({percentage}%)</span>
                        </div>
                      )}
                    </div>
                    {isExpired && (
                      <div className="relative">
                        <div className="overflow-hidden h-3 rounded-full bg-gray-50">
                          <div
                            style={{ width: `${percentage}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isWinner 
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-400'
                                : isRunnerUp 
                                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-250'
                                  : 'bg-gradient-to-r from-indigo-600 to-indigo-100'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {showStopModal && !isExpired && !poll.isClosed && (
          <StopPollButton 
            pollId={id!} 
            onStop={() => {
              setShowStopModal(false);
            }}
            onCancel={() => setShowStopModal(false)}
          />
        )}
        {showDeleteModal && (
          <DeletePollButton 
            pollId={id!} 
            onDelete={async (password) => {
              await handleDelete(password);
              setShowDeleteModal(false);
            }}
            onCancel={() => setShowDeleteModal(false)}
          />
        )}
      </Card>
    </div>
  )
}

export default PollDetail
