import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showOnlineStatus?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = 'User',
  image,
  size = 'md',
  className = '',
  showOnlineStatus = false,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  const getInitials = (n?: string | null) => {
    if (!n) return 'U';
    const parts = n.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {image ? (
        <img
          src={image}
          alt={name || 'Avatar'}
          className={`${sizeClasses[size].split(' ')[0]} ${sizeClasses[size].split(' ')[1]} rounded-full object-cover ring-1 ring-surface-container-low`}
          onError={(e) => {
            // Fallback if remote image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-primary/20 text-primary font-mono font-semibold flex items-center justify-center ring-1 ring-primary/30`}
        >
          {getInitials(name)}
        </div>
      )}

      {showOnlineStatus && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary rounded-full ring-2 ring-surface" />
      )}
    </div>
  );
};
