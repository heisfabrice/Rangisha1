import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = (localStorage.getItem('rangisha_theme') || localStorage.getItem('ranga_theme')) as Theme;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
      }
    } catch (e) {}
    return 'dark'; // Dark mode is default
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('rangisha_theme') || localStorage.getItem('ranga_theme');
      if (stored === 'light') return false;
      if (stored === 'dark') return true;
      if (stored === 'system') {
        return typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
      }
    } catch (e) {}
    return true; // Default dark
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let dark = true;
      if (theme === 'dark') {
        dark = true;
      } else if (theme === 'light') {
        dark = false;
      } else {
        dark = mediaQuery.matches;
      }

      setIsDark(dark);
      if (dark) {
        root.classList.add('dark');
        root.classList.remove('light');
        root.setAttribute('data-theme', 'dark');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.setAttribute('data-theme', 'light');
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
    };

    applyTheme();
    try {
      localStorage.setItem('rangisha_theme', theme);
    } catch (e) {}

    const listener = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

