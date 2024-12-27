interface PopupProps {
  message: string;
  countdown?: number;
  isSuccess?: boolean;
}

const Popup = ({ message, countdown, isSuccess = true }: PopupProps) => {
  return (
    <div className="fixed top-8 right-8 z-50 animate-slide-down">
      <div className={`
        flex items-center space-x-2 px-6 py-3 rounded-lg shadow-lg
        ${isSuccess ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}
      `}>
        <svg 
          className={`h-5 w-5 ${isSuccess ? 'text-green-500' : 'text-red-500'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isSuccess ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} 
          />
        </svg>
        <div className={`text-sm ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
          {message}
          {countdown !== null && countdown !== undefined && (
            <span className={`ml-2 font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              ({countdown}s)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Popup; 