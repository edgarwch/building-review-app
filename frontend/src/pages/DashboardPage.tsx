import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/submissions';
import { Folder, ClipboardList, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { CardSkeleton, ListSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

const statCards = [
  {
    key: 'totalProjects' as const,
    label: 'Total Projects',
    color: 'bg-blue-500',
    icon: Folder,
  },
  {
    key: 'totalSubmissions' as const,
    label: 'Total Submissions',
    color: 'bg-emerald-500',
    icon: ClipboardList,
  },
  {
    key: 'openSubmissions' as const,
    label: 'Open',
    color: 'bg-amber-500',
    icon: Clock,
  },
  {
    key: 'reviewedSubmissions' as const,
    label: 'Reviewed',
    color: 'bg-indigo-500',
    icon: CheckCircle,
  },
];

function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
      <div className="animate-pulse space-y-3">
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="pt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div>
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <ListSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-4">
        <ErrorState message="Failed to load dashboard stats." onRetry={() => refetch()} />
      </div>
    );
  }

  if (!data) return null;

  if (data.totalProjects === 0 && data.totalSubmissions === 0) {
    return (
      <div className="pt-4">
        <EmptyState
          title="Welcome to Building Review"
          description="Get started by creating a project in the Projects tab."
          action={{ label: 'Go to Projects', onClick: () => navigate('/projects') }}
        />
      </div>
    );
  }

  const stats: Record<string, number> = {
    totalProjects: data.totalProjects,
    totalSubmissions: data.totalSubmissions,
    openSubmissions: data.openSubmissions,
    reviewedSubmissions: data.reviewedSubmissions,
  };

  return (
    <div className="pt-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats[card.key]}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {card.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Submissions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Recent Submissions
        </h2>

        {data.recent.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-400 dark:text-gray-500">No submissions yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {data.recent.map((sub) => (
              <div
                key={sub._id}
                onClick={() => navigate(`/submissions/${sub._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {sub.projectName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {sub.templateName} &middot; by {sub.username}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(sub.submittedAt).toLocaleDateString()} &middot; {sub.itemCount} item{sub.itemCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === 'reviewed'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    }`}
                  >
                    {sub.status === 'reviewed' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <ClipboardList className="w-3 h-3" />
                    )}
                    {sub.status}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
