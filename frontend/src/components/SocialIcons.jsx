import { FaInstagram, FaTiktok, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { SOCIAL } from '../constants/brand';

const ICONS = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  facebook: FaFacebook,
  linkedin: FaLinkedin,
};

export default function SocialIcons({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIAL.map(({ name, url, icon }) => {
        const Icon = ICONS[icon];
        return (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
            className={`${sizeClasses[size]} flex items-center justify-center rounded-full
              bg-white/10 text-white border border-white/20
              hover:bg-brand-gold hover:text-brand-midnight hover:border-brand-gold
              transition-all duration-300 hover:scale-110 hover:shadow-gold`}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}

export function SocialIconsLight({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {SOCIAL.map(({ name, url, icon }) => {
        const Icon = ICONS[icon];
        return (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={name}
            title={name}
            className={`${sizeClasses[size]} flex items-center justify-center rounded-full
              bg-brand-cream text-brand-navy border border-brand-navy/10
              hover:bg-brand-gold hover:text-white hover:border-brand-gold
              transition-all duration-300 hover:scale-110 hover:shadow-gold`}
          >
            <Icon />
          </a>
        );
      })}
    </div>
  );
}
