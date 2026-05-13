import { Outlet } from 'react-router-dom';
import BottomTabs from './BottomTabs';
import OfflineBanner from './OfflineBanner';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Sun, Moon } from 'lucide-react';

export default function AppLayout() {
  const [dark, toggleDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <OfflineBanner />
      <main className="max-w-lg mx-auto px-4 py-6 relative">
        <button
          onClick={toggleDark}
          className="absolute top-2 right-0 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}
