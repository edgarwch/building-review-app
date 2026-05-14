import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createTemplate, updateTemplate, getTemplate } from '../../api/templates';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';

interface ItemRow {
  key: string;
  label: string;
  type: 'boolean' | 'text' | 'number';
}

export default function TemplateEditorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const projectId = searchParams.get('projectId') || '';
  const editId = searchParams.get('edit');

  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ key: '', label: '', type: 'boolean' }]);

  const isEdit = !!editId;

  const { data: existingTemplate, isLoading: templateLoading, error: templateError } = useQuery({
    queryKey: ['template', editId],
    queryFn: () => getTemplate(editId!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingTemplate) {
      setCategory(existingTemplate.category);
      setName(existingTemplate.name);
      setItems(existingTemplate.items.map((it) => ({ key: it.key, label: it.label, type: it.type })));
    }
  }, [existingTemplate]);

  const createMutation = useMutation({
    mutationFn: () => createTemplate(projectId, category, name, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates', projectId] });
      navigate(`/projects/${projectId}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateTemplate(editId!, projectId, category, name, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-templates', projectId] });
      queryClient.invalidateQueries({ queryKey: ['template', editId] });
      navigate(`/projects/${projectId}`);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category.trim() || !name.trim()) return;
    if (!projectId) return;
    if (items.some((it) => !it.key.trim() || !it.label.trim())) return;

    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const addItem = () => {
    setItems([...items, { key: '', label: '', type: 'boolean' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    const updated = [...items];
    if (field === 'key') {
      updated[index] = { ...updated[index], key: value };
    } else if (field === 'label') {
      updated[index] = { ...updated[index], label: value };
    } else if (field === 'type') {
      updated[index] = { ...updated[index], type: value as 'boolean' | 'text' | 'number' };
    }
    setItems(updated);
  };

  if (isEdit && templateLoading) {
    return (
      <div className="pt-4">
        <CardSkeleton />
      </div>
    );
  }

  if (isEdit && templateError) {
    return (
      <div className="pt-4">
        <ErrorState message="Failed to load template." />
      </div>
    );
  }

  const backTo = projectId ? `/projects/${projectId}` : '/projects';

  return (
    <div>
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-5">
          {isEdit ? 'Edit Template' : 'New Template'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={100}
              placeholder="e.g. Electrical, Plumbing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              maxLength={200}
              placeholder="e.g. Electrical Inspection Checklist"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Checklist Items
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) => updateItem(idx, 'key', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Key"
                      maxLength={50}
                      required
                    />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(idx, 'label', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Label"
                      maxLength={200}
                      required
                    />
                    <div className="flex gap-2">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(idx, 'type', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="boolean">Yes/No</option>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSaving || !projectId}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
            <button
              type="button"
              onClick={() => navigate(backTo)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
