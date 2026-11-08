'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TakeoLogo } from '@/components/ui/TakeoLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Credenciales incorrectas. Verificá tu email y contraseña.'
          : error.message
      );
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] dark:bg-[#0d0e12] p-4 sm:p-6 overflow-hidden">
      {/* Subtle Ambient Background Glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-orange-500/10 dark:bg-orange-500/15 blur-[110px] rounded-full" />

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Back to Landing */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-zinc-900/95 p-7 sm:p-9 rounded-3xl shadow-xl shadow-black/5 dark:shadow-black/40 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
          {/* Brand Logo & Heading */}
          <div className="flex flex-col items-center text-center space-y-3">
            <Link href="/" className="group inline-flex flex-col items-center gap-2">
              <TakeoLogo
                variant="rounded"
                size={52}
                animated
                className="rounded-2xl shadow-lg shadow-orange-500/30 ring-1 ring-orange-400/20 group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-extrabold text-xs tracking-[0.2em] uppercase text-orange-600 dark:text-orange-400">
                TAKEO
              </span>
            </Link>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                Bienvenido de nuevo
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Ingresá a tu panel para gestionar pedidos y catálogo en vivo.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-medium rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login-email">Email de tu cuenta</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@tunegocio.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">Contraseña</Label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-bold flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Ingresando al panel...' : 'Iniciar Sesión'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center">
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              ¿Todavía no tenés tu tienda en TAKEO?
            </p>
            <Link
              href="/register"
              className="mt-2.5 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/40 dark:hover:bg-orange-950/20 transition-all"
            >
              <Store className="w-4 h-4 text-orange-500" />
              <span>Crear cuenta y negocio</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
