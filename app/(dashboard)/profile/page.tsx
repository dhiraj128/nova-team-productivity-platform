'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Shield, Award, Key } from 'lucide-react';
import { UserAvatar } from '@/components/branding/UserAvatar';

export default function ProfilePage() {
  const { data: session } = useSession();

  const user = session?.user || {
    name: 'Dheeraj Kumar',
    email: 'dheeraj@nova.app',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0iRXzv10MO3JR7wW6rDxypqHvQWbVlIFuMRgjYHtQEBqzaVgOjN0BMLN4tfkSStOmZ8637odOMYeTtvF-36Cw6LDIfuXRxLwqvchvIrX8c5k2XEl5T8-f4G2KBRxpEQsvNZFxnCte_bQH0nP9hFPprjfP5m56CSqzTu0kqnfb6yii-okol00k1-a8Dtl29Eprw1WEJ0xYiSFvK8F8ywaRkEKe436ITLRWLZSBnGB2FtWLaNg2sP0BBw',
    role: 'Tech Lead & Senior Full Stack Intern Candidate',
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-on-surface tracking-tight">User Profile & Account</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Manage your personal workspace identity and credentials.
        </p>
      </div>

      <div className="bg-surface-container-low border border-surface-container-high/60 rounded-xl p-6 space-y-6 shadow-md">
        <div className="flex items-center gap-4">
          <UserAvatar name={user.name} image={user.image} size="lg" />
          <div>
            <h2 className="text-lg font-bold text-on-surface">{user.name}</h2>
            <p className="text-xs font-mono text-secondary">{(user as any).role || 'Tech Lead & Candidate'}</p>
            <p className="text-xs text-on-surface-variant mt-0.5">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-surface-container-high">
          <div>
            <label className="block text-xs font-mono uppercase text-outline mb-1">Full Candidate Name</label>
            <input
              type="text"
              readOnly
              value={user.name || 'Dheeraj Kumar'}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-outline mb-1">Work Email</label>
            <input
              type="email"
              readOnly
              value={user.email || 'dheeraj@nova.app'}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-xs font-mono text-on-surface focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-outline mb-1">Primary Role</label>
            <input
              type="text"
              readOnly
              value={(user as any).role || 'Senior Full Stack Intern Lead'}
              className="w-full px-3.5 py-2 rounded-lg bg-surface-container border border-surface-container-high text-xs font-semibold text-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
