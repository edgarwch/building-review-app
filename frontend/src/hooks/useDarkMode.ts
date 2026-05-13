import { useState, useEffect } from 'react';

export function useDarkMode(): [boolean, () => void] {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(dark));
  }, [dark]);

  const toggle = () => setDark(prev => !prev);

  return [dark, toggle];
}
