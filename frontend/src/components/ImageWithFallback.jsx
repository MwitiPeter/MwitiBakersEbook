import { useState } from 'react';
import { HiPhotograph, HiBookOpen, HiPlay } from 'react-icons/hi';

const FALLBACK_CONTENT = {
  image: {
    icon: HiPhotograph,
    bg: 'bg-gradient-to-br from-brand-navy to-blue-800',
    label: 'No Image',
  },
  book: {
    icon: HiBookOpen,
    bg: 'bg-gradient-to-br from-brand-gold to-yellow-800',
    label: 'No Cover',
  },
  video: {
    icon: HiPlay,
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-800',
    label: 'No Thumbnail',
  },
};

export default function ImageWithFallback({ src, alt, className, type = 'image' }) {
  const [hasError, setHasError] = useState(false);
  const fallback = FALLBACK_CONTENT[type] || FALLBACK_CONTENT.image;

  if (!src || hasError) {
    return (
      <div className={`${className} ${fallback.bg} flex items-center justify-center`}>
        <div className="text-center text-white/70">
          <fallback.icon className="text-4xl mx-auto mb-1" />
          <span className="text-xs font-medium">{fallback.label}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}
