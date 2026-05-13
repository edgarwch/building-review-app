import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-500 dark:text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
