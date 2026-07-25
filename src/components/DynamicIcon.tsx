import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps {
  name?: string;
  className?: string;
  size?: number;
  fallback?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({
  name = 'Globe',
  className = 'w-5 h-5',
  size = 20,
  fallback = 'Globe',
}) => {
  if (!name) {
    const FallbackComponent = (Icons as any)[fallback] || Icons.Globe;
    return <FallbackComponent className={className} size={size} />;
  }

  // Check if icon is an image URL or base64/favicon path
  if (name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/') || name.startsWith('data:')) {
    return (
      <img
        src={name}
        alt="icon"
        className={`object-cover rounded ${className}`}
        style={{ width: size, height: size }}
        onError={(e) => {
          // Fallback to default Lucide Globe icon on error
          const target = e.currentTarget;
          target.style.display = 'none';
          if (target.parentElement) {
            const fallbackEl = document.createElement('span');
            fallbackEl.className = 'inline-block text-slate-400 dark:text-slate-500';
            fallbackEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>`;
            target.parentElement.appendChild(fallbackEl);
          }
        }}
      />
    );
  }

  // Look up Lucide component by name
  const LucideComponent = (Icons as any)[name] || (Icons as any)[fallback] || Icons.Globe;

  return <LucideComponent className={className} size={size} />;
};
