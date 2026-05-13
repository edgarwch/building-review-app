import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplate } from '../api/templates';
import { submitChecklist } from '../api/submissions';
import { ArrowLeft, Loader2, Send, Image } from 'lucide-react';
import MediaCapture, { MediaThumbnail } from '../components/MediaCapture';
import { Skeleton } from '../components/ui/Skeleton';
import { ErrorState } from '../components/ui/ErrorState';

export default function SubmissionNewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<{ fileId: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', templateId],
    queryFn: () => getTemplate(templateId!),
    enabled: !!templateId,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!template) throw new Error('Template not loaded');
      const items = template.items.map((item) => ({
        tool: item.key,
        details: formValues[item.key] ?? '',
      }));
      return submitChecklist({
        projectId: projectId!,
        templateId: template._id,
        templateName: template.name,
        items,
      });
    },
    onSuccess: (submission) => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      navigate(`/submissions/${submission._id}`);
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
    if (formErrors[key]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    const errors: Record<string, string> = {};
    for (const item of template.items) {
      const val = formValues[item.key] ?? '';
      if (item.type === 'text' && item.label.toLowerCase().includes('required') && !val.trim()) {
        errors[item.key] = 'This field is required';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pt-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-4 space-y-3">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="pt-4">
        <ErrorState
          message="Template not found."
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Project
      </button>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{template.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{template.category}</p>
        </div>

        <div className="space-y-4">
          {template.items.map((item) => (
            <div
              key={item.key}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5"
            >
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {item.label}
              </label>

              {item.type === 'boolean' && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formValues[item.key] === 'true'}
                    onChange={(e) => handleChange(item.key, e.target.checked ? 'true' : 'false')}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formValues[item.key] === 'true' ? 'Yes' : 'No'}
                  </span>
                </div>
              )}

              {item.type === 'text' && (
                <textarea
                  value={formValues[item.key] ?? ''}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors[item.key]
                      ? 'border-red-400 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder={`Enter ${item.label.toLowerCase()}...`}
                />
              )}

              {item.type === 'number' && (
                <input
                  type="number"
                  value={formValues[item.key] ?? ''}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              )}

              {formErrors[item.key] && (
                <p className="mt-1 text-xs text-red-500">{formErrors[item.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Media Capture */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Image className="w-4 h-4" />
            Photos & Videos
          </h2>
          <MediaCapture onUpload={(fileId, url) => setMedia((prev) => [...prev, { fileId, url }])} uploading={uploading} setUploading={setUploading} />
          {media.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {media.map((m) => (
                <MediaThumbnail
                  key={m.fileId}
                  url={m.url}
                  type={m.url.match(/\.(mp4|mov|avi)$/i) ? 'video' : 'image'}
                  onRemove={() => setMedia((prev) => prev.filter((x) => x.fileId !== m.fileId))}
                />
              ))}
            </div>
          )}
        </div>

        {mutation.isError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {mutation.error instanceof Error ? mutation.error.message : 'Failed to submit checklist'}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Checklist
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
