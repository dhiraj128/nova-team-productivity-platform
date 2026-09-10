'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, UserCheck, ShieldCheck } from 'lucide-react';
import { NovaLogo } from '@/components/branding/NovaLogo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('dheeraj@nova.app');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface-container-low border border-surface-container-high/80 rounded-2xl p-8 space-y-6 shadow-2xl relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <NovaLogo size={44} showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Sign in to NOVA</h1>
          <p className="text-xs text-on-surface-variant">Team Productivity Platform & Workspace</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-error-container/40 border border-error/30 text-error text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-medium uppercase text-on-surface-variant mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium uppercase text-on-surface-variant mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-primary text-on-primary font-semibold text-xs shadow-md hover:bg-primary-container hover:text-on-primary-container active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            <span>Sign In to Dashboard</span>
          </button>
        </form>

        {/* Demo Quick Logins Box */}
        <div className="pt-4 border-t border-surface-container-high/60 space-y-2">
          <span className="block text-[11px] font-mono uppercase text-outline text-center">
            ⚡ Demo Accounts (One-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('dheeraj@nova.app')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] text-primary font-mono text-left truncate border border-primary/20"
            >
              Dheeraj Kumar (Lead)
            </button>
            <button
              onClick={() => handleQuickLogin('rahul@nova.app')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] text-on-surface font-mono text-left truncate"
            >
              Rahul Sharma
            </button>
            <button
              onClick={() => handleQuickLogin('priya@nova.app')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] text-secondary font-mono text-left truncate"
            >
              Priya Singh
            </button>
            <button
              onClick={() => handleQuickLogin('aman@nova.app')}
              className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-[11px] text-tertiary font-mono text-left truncate"
            >
              Aman Kumar
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-on-surface-variant">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
