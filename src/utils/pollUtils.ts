interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export const getWinningOption = (options: PollOption[]) => {
  if (!options || options.length === 0) return null;

  // Trier les options par nombre de votes
  const sortedOptions = [...options].sort((a, b) => b.votes - a.votes);
  
  // Obtenir le nombre maximum de votes
  const maxVotes = sortedOptions[0].votes;
  
  // Trouver toutes les options avec ce nombre maximum de votes
  const tiedOptions = sortedOptions.filter(opt => opt.votes === maxVotes);

  // S'il y a plus d'une option avec le nombre maximum de votes, c'est une égalité
  if (tiedOptions.length > 1) {
    return {
      type: 'TIE' as const,
      options: tiedOptions
    };
  }

  // Sinon, il y a un gagnant unique
  return {
    type: 'WINNER' as const,
    option: sortedOptions[0]
  };
}; 