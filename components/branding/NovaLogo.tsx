import React from 'react';

interface NovaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const NovaLogo: React.FC<NovaLogoProps> = ({ className = '', size = 32, showText = true }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <rect width="40" height="40" rx="10" fill="#4F46E5" />
        <path
          d="M12 28V12L28 28V12"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="12" r="2.5" fill="#A5B4FC" />
      </svg>
      {showText && (
        <span className="font-sans font-semibold text-lg tracking-tight text-on-surface">
          NOVA
        </span>
      )}
    </div>
  );
};
