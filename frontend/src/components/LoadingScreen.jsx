import { memo } from 'react';

const LoadingScreen = memo(function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading">
      <div className="text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm sm:text-base">Loading Mwiti Bakers...</p>
      </div>
    </div>
  );
});

export default LoadingScreen;
