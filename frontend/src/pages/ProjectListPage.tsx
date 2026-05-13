import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { listProjects, createProject, deleteProject } from '../api/projects';
import { Plus, Trash2 } from 'lucide-react';
import { ListSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export default function ProjectListPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  const createMutation = useMutation({
    mutationFn: () => createProject(name, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setName('');
      setAddress('');
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    createMutation.mutate();
  };

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="pt-4">
        <ListSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load projects." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-3">
          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={100}
          />
          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            maxLength={200}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!projects || projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to get started."
        />
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <Link
                to={`/projects/${project._id}`}
                className="block"
              >
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{project.address}</p>
              </Link>
              {isAdmin && (
                <div className="flex justify-end mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Delete this project? This cannot be undone.')) {
                        deleteMutation.mutate(project._id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
