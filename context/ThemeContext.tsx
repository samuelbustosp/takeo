'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname?.startsWith('/dashboard') ?? false;
  const isLandingRoute = pathname === '/';

  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('takeo_dashboard_theme') as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        setThemeState(savedTheme);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      const systemIsDark = mediaQuery.matches;

      // Landing page ('/') is ALWAYS dark regardless of device configuration.
      // Catalog & other routes follow device/OS theme (prefers-color-scheme).
      // Dashboard follows the dashboard toggle (defaulting to device/OS theme).
      let shouldBeDark = systemIsDark;
      if (isLandingRoute) {
        shouldBeDark = true;
      } else if (isDashboardRoute) {
        if (theme === 'dark') {
          shouldBeDark = true;
        } else if (theme === 'light') {
          shouldBeDark = false;
        } else {
          shouldBeDark = systemIsDark;
        }
      }

      setResolvedTheme(shouldBeDark ? 'dark' : 'light');

      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateResolved();
    mediaQuery.addEventListener('change', updateResolved);
    return () => mediaQuery.removeEventListener('change', updateResolved);
  }, [theme, isDashboardRoute, isLandingRoute]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('takeo_dashboard_theme', newTheme);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
