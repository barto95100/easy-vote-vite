import { getWinningOption } from '../utils/pollUtils';

const PollResults = ({ poll }: { poll: Poll }) => {
  const winningResult = getWinningOption(poll.options);
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="space-y-6">
      {winningResult?.type === 'TIE' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Égalité entre plusieurs options
          </h3>
          <div className="space-y-2">
            {winningResult.options.map(option => (
              <div key={option.id} className="flex items-center justify-between">
                <span className="text-yellow-700">{option.text}</span>
                <span className="text-yellow-600 font-medium">
                  {option.votes} votes ({((option.votes / totalVotes) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ... affichage du gagnant
      )}
    </div>
  );
};

export default PollResults; 