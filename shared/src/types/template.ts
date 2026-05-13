export interface TemplateItem {
  key: string;
  label: string;
  type: 'boolean' | 'text' | 'number';
}

export interface Template {
  _id: string;
  projectId: string;
  category: string;
  name: string;
  items: TemplateItem[];
  createdAt: string;
}
