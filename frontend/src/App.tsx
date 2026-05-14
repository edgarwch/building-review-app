import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SubmissionNewPage from './pages/SubmissionNewPage';
import SubmissionDetailPage from './pages/SubmissionDetailPage';
import DashboardPage from './pages/DashboardPage';
import TemplateEditorPage from './pages/admin/TemplateEditorPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

function ProtectedRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<ProtectedRoutes />}>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectListPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="projects/:projectId/submissions/new" element={<SubmissionNewPage />} />
              <Route path="submissions/:id" element={<SubmissionDetailPage />} />
              <Route path="admin/templates/new" element={<TemplateEditorPage />} />
              <Route
                path="profile"
                element={
                  <ProfilePlaceholder />
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function ProfilePlaceholder() {
  const { user, logout } = useAuth();
  return (
    <div className="text-center pt-4">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
        {user?.username?.[0]?.toUpperCase()}
      </div>
      <h2 className="text-lg font-semibold">{user?.username}</h2>
      <p className="text-sm text-gray-500 capitalize mb-4">{user?.role}</p>
      <button
        onClick={logout}
        className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
}
