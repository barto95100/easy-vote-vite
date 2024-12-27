import { useState } from 'react';

interface SharePollButtonProps {
  pollId: string;
}

const SharePollButton = ({ pollId }: SharePollButtonProps) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleCopyLink = async () => {
    const pollUrl = `${window.location.origin}/polls/${pollId}`;
    try {
      await navigator.clipboard.writeText(pollUrl);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopyLink}
        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
        title="Copier le lien"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      </button>

      {showCopiedMessage && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
          Lien copié !
        </div>
      )}
    </div>
  );
};

export default SharePollButton; 