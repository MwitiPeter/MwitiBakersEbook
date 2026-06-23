import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', showTagline = true, className = '' }) {
  const sizes = {
    sm: { img: 'h-10 w-10', title: 'text-base', tagline: 'text-[10px]' },
    md: { img: 'h-12 w-12', title: 'text-lg', tagline: 'text-xs' },
    lg: { img: 'h-16 w-16', title: 'text-xl', tagline: 'text-sm' },
    xl: { img: 'h-24 w-24', title: 'text-2xl', tagline: 'text-sm' },
  };

  const s = sizes[size];

  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`}>
      <img
        src="/logo.jpg"
        alt="Mwiti Bakers Logo"
        className={`${s.img} rounded-full object-cover shadow-md group-hover:shadow-gold transition-shadow duration-300`}
      />
      {(showTagline || size !== 'sm') && (
        <div className="hidden sm:block">
          <span className={`${s.title} font-bold text-brand-navy group-hover:text-brand-gold transition-colors block leading-tight`}>
            Mwiti Bakers
          </span>
          {showTagline && (
            <span className={`${s.tagline} font-script text-brand-gold block -mt-0.5`}>
              Home of Sweetness
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
