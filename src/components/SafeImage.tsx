import { useState } from 'react';
import { Anchor } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function SafeImage({ src, alt, className = '', fallbackTitle }: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0F4C81] via-[#1B5E8A] to-[#274659] text-white/90 p-6 text-center ${className}`}
      >
        <Anchor className="w-8 h-8 mb-2 opacity-80" aria-hidden="true" />
        <span className="font-serif text-base font-medium max-w-xs">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
