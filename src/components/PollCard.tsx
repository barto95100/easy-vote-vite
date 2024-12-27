import React, { useEffect } from 'react';
import { getWinningOption } from '../utils/pollUtils';
import Card from './Card';
import type { Poll } from '../types';

const PollCard = ({ poll }: { poll: Poll }) => {
  // Logs directs des données du sondage
  console.log('==================== POLL CARD ====================');
  console.log('Poll ID:', poll.id);
  console.log('Poll Title:', poll.title);
  console.log('Raw Options:', JSON.stringify(poll.options, null, 2));

  // Traitement des votes avec tri immédiat
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes);
  const totalVotes = sortedOptions.reduce((sum, opt) => sum + opt.votes, 0);
  const isExpired = new Date(poll.expiresAt) < new Date();

  // Vérification explicite de l'égalité
  const hasEqualVotes = sortedOptions.length >= 2 && 
    sortedOptions[0].votes === sortedOptions[1].votes && 
    sortedOptions[0].votes > 0;

  // Composant d'affichage du résultat
  const ResultDisplay = () => {
    if (!totalVotes) return null;

    if (hasEqualVotes) {
      const equalOptions = sortedOptions.filter(opt => opt.votes === sortedOptions[0].votes);
      return (
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
          <p className="font-medium text-yellow-800">Égalité</p>
          <div className="text-sm text-yellow-700">
            {equalOptions.map((opt, idx) => (
              <span key={opt.id}>
                {opt.text}
                {idx < equalOptions.length - 1 ? ' / ' : ''}
              </span>
            ))}
            <p className="mt-1 text-yellow-600">
              {sortedOptions[0].votes} vote{sortedOptions[0].votes > 1 ? 's' : ''} chacun
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
        <p className="font-medium text-green-800">Choix gagnant</p>
        <p className="text-sm text-green-700">{sortedOptions[0].text}</p>
        <p className="text-sm mt-1 text-green-600">
          {sortedOptions[0].votes} vote{sortedOptions[0].votes > 1 ? 's' : ''}
        </p>
      </div>
    );
  };

  console.log('==================================================');

  return (
    <Card 
      className={`
        h-full group hover:transform hover:scale-[1.02] transition-all duration-200
        bg-gradient-to-b from-indigo-100 via-indigo-50 to-white
        hover:shadow-xl
        ${isExpired ? 'opacity-80' : ''}
      `}
    >
      <a href={`/poll/${poll.id}`} className="block h-full">
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {poll.title}
            </h3>
            <div className="flex gap-2">
              {poll.isPrivate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m4-6V4" />
                  </svg>
                  Privé
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                poll.isClosed || isExpired
                  ? 'bg-red-100 text-red-800'  // Rouge pour "Terminé"
                  : 'bg-green-100 text-green-800'  // Vert pour "En cours"
              }`}>
                {poll.isClosed || isExpired ? 'Terminé' : 'En cours'}
              </span>
            </div>
          </div>

          {poll.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {poll.description}
            </p>
          )}

          <div className="mt-auto space-y-4">
            {isExpired && totalVotes > 0 && (
              <div className="border-t pt-4">
                <ResultDisplay />
              </div>
            )}
          </div>
        </div>
      </a>
    </Card>
  );
};

export default PollCard; 