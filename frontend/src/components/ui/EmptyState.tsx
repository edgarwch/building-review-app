import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <FolderOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      {description && <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
