import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderOpen, User } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/projects', label: 'Projects', icon: FolderOpen },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 safe-area-bottom z-50">
      <div className="flex max-w-lg mx-auto">
        {tabs.map((tab) => {
          const active = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
