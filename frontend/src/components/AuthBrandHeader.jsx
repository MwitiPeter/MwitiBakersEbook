export default function AuthBrandHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <img
        src="/logo.jpg"
        alt="Mwiti Bakers"
        className="w-16 h-16 rounded-full mx-auto shadow-gold object-cover"
      />
      <h1 className="text-3xl font-bold text-brand-navy mt-3">{title}</h1>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      <p className="font-script text-brand-gold text-lg mt-1">Home of Sweetness</p>
    </div>
  );
}
