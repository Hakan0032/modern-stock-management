import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'system';
  });

  const getEffectiveTheme = (themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themeValue;
  };

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme(theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);

    // Listen for system theme changes when using system theme
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        const newEffectiveTheme = getEffectiveTheme('system');
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newEffectiveTheme);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      if (prevTheme === 'light') return 'dark';
      if (prevTheme === 'dark') return 'system';
      return 'light';
    });
  };

  const setSpecificTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const effectiveTheme = getEffectiveTheme(theme);

  return {
    theme,
    effectiveTheme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: effectiveTheme === 'dark'
  };
}