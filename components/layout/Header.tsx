'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Menu, Search, User, LogOut, Settings, PanelLeft } from 'lucide-react';
import { NovaLogo } from '../branding/NovaLogo';
import { UserAvatar } from '../branding/UserAvatar';
import { NotificationsDropdown } from './NotificationsDropdown';
import { GlobalSearchModal } from './GlobalSearchModal';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getPageTitle = () => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/projects')) return 'Projects';
    if (pathname.startsWith('/tasks')) return 'My Tasks';
    if (pathname.startsWith('/calendar')) return 'Calendar';
    if (pathname.startsWith('/reports')) return 'Reports';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Workspace';
  };

  const currentUser = session?.user || {
    name: 'Dheeraj Kumar',
    email: 'dheeraj@nova.app',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0iRXzv10MO3JR7wW6rDxypqHvQWbVlIFuMRgjYHtQEBqzaVgOjN0BMLN4tfkSStOmZ8637odOMYeTtvF-36Cw6LDIfuXRxLwqvchvIrX8c5k2XEl5T8-f4G2KBRxpEQsvNZFxnCte_bQH0nP9hFPprjfP5m56CSqzTu0kqnfb6yii-okol00k1-a8Dtl29Eprw1WEJ0xYiSFvK8F8ywaRkEKe436ITLRWLZSBnGB2FtWLaNg2sP0BBw',
  };

  return (
    <>
      <header className="fixed top-0 w-full z-40 pt-safe bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container-high/40">
        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              aria-label="Toggle drawer"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors rounded-lg hover:bg-surface-container"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <NovaLogo size={32} showText={true} />
            </Link>

            <div className="h-4 w-[1px] bg-outline-variant/30 ml-1 hidden sm:block" />

            <span className="text-xs font-sans text-on-surface-variant line-clamp-1 truncate hidden sm:block">
              {getPageTitle()}
            </span>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Global Search"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all text-xs"
            >
              <Search className="w-4 h-4 text-outline" />
              <span className="hidden md:inline">Search...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant font-mono text-[9px]">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* User Profile */}
            <div className="relative pl-1">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center justify-center p-0.5 rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all"
              >
                <UserAvatar name={currentUser.name} image={currentUser.image} size="sm" showOnlineStatus />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-surface-container-low border border-surface-container-high rounded-xl shadow-2xl z-50 p-2 divide-y divide-surface-container-high">
                    <div className="px-3 py-2">
                      <div className="text-xs font-semibold text-on-surface truncate">{currentUser.name}</div>
                      <div className="text-[11px] font-mono text-on-surface-variant truncate">{currentUser.email}</div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4 text-outline" />
                        Profile Settings
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
                      >
                        <Settings className="w-4 h-4 text-outline" />
                        Workspace Settings
                      </Link>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-xs text-error hover:bg-error-container/20 rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
