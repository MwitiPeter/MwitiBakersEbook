export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <div className="text-center animate-fade-in">
        <img
          src="/logo.jpg"
          alt="Mwiti Bakers"
          className="w-24 h-24 rounded-full mx-auto mb-6 shadow-gold animate-pulse object-cover"
        />
        <div className="w-12 h-12 border-4 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin mx-auto mb-4" />
        <p className="text-brand-navy text-lg font-semibold">Loading Mwiti Bakers...</p>
        <p className="font-script text-brand-gold mt-1">Home of Sweetness</p>
      </div>
    </div>
  );
}
