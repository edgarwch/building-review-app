import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="bg-yellow-500 text-yellow-900 text-sm font-medium text-center py-2 px-4 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      You're offline. Changes will sync when reconnected.
    </div>
  );
}
