export default function LoadingScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-brand-gold border-t-brand-navy rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading Mwiti Bakers...</p>
      </div>
    </div>
  );
}
