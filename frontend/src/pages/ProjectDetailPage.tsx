import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getProject, updateProject } from '../api/projects';
import { listProjectTemplates } from '../api/templates';
import { listSubmissions } from '../api/submissions';
import { ArrowLeft, Edit2, Save, X, FileText, Plus, ClipboardList, CheckCircle, ExternalLink } from 'lucide-react';
import { CardSkeleton, ListSkeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id!),
    enabled: !!id,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['project-templates', id],
    queryFn: () => listProjectTemplates(id!),
    enabled: !!id,
  });

  const { data: recentSubmissions = [] } = useQuery({
    queryKey: ['submissions', { projectId: id }],
    queryFn: () => listSubmissions({ projectId: id }),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: () => updateProject(id!, name, address),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setEditing(false);
    },
  });

  const handleEdit = () => {
    if (project) {
      setName(project.name);
      setAddress(project.address);
      setEditing(true);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;
    updateMutation.mutate();
  };

  const isAdmin = user?.role === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-6 pt-4">
        <CardSkeleton />
        <div>
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
          <ListSkeleton count={2} />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="pt-4">
        <ErrorState
          message="Project not found."
          onRetry={() => navigate('/projects')}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-3">
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
                disabled={updateMutation.isPending}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{project.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{project.address}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
            {isAdmin && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-1 mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
          </>
        )}
      </div>

      {/* Templates Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Templates
          </h2>
          {isAdmin && (
            <button
              onClick={() => navigate(`/admin/templates/new?projectId=${id}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Template
            </button>
          )}
        </div>

        {templates.length === 0 ? (
          <EmptyState
            title="No templates yet"
            description="Create one to start inspections."
          />
        ) : (
          <div className="grid gap-3">
            {templates.map((template) => (
              <div
                key={template._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {template.category} &middot; {template.items.length} item{template.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/projects/${id}/submissions/new?templateId=${template._id}&projectId=${id}`)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ClipboardList className="w-3 h-3" />
                    Fill
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => navigate(`/admin/templates/new?edit=${template._id}&projectId=${id}`)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submissions Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Submissions
          </h2>
          {templates.length > 0 && (
            <button
              onClick={() => navigate(`/projects/${id}/submissions/new?templateId=${templates[0]._id}&projectId=${id}`)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Submission
            </button>
          )}
        </div>

        {recentSubmissions.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Fill out a template to start."
          />
        ) : (
          <div className="grid gap-3">
            {recentSubmissions.slice(0, 5).map((sub) => (
              <div
                key={sub._id}
                onClick={() => navigate(`/submissions/${sub._id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {sub.templateName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {new Date(sub.submittedAt).toLocaleDateString()} &middot; by {sub.username}
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {recentSubmissions.length > 5 && (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-1">
                Showing 5 of {recentSubmissions.length} submissions
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
