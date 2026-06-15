import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, Loader2 } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { TestCaseList } from '../components/TestCaseList';
import { api } from '../services/api';
import type { ProjectDetail } from '../types';

export function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [regenerating, setRegenerating] = useState(false);

  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      const data = await api.getProject(Number(id));
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    const interval = setInterval(() => {
      if (project?.status === 'pending' || project?.status === 'processing') {
        loadProject();
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [loadProject, project?.status]);

  const handleRegenerate = async () => {
    if (!id || !confirm('Regenerate all test cases? Existing test cases will be replaced.')) return;
    setRegenerating(true);
    try {
      await api.regenerateProject(Number(id));
      await loadProject();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed');
    } finally {
      setRegenerating(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    try {
      await api.exportProject(Number(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 text-center">
          <p className="text-red-600">{error || 'Project not found'}</p>
          <Link to="/dashboard" className="btn-primary mt-4 inline-flex">Back to Dashboard</Link>
        </main>
      </div>
    );
  }

  const isProcessing = project.status === 'pending' || project.status === 'processing';

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600 mb-6">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Created {new Date(project.created_at).toLocaleString()} &middot; Status:{' '}
              <span className="font-medium capitalize">{project.status}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} disabled={isProcessing || project.test_cases.length === 0} className="btn-secondary">
              <Download className="h-4 w-4" aria-hidden="true" />
              Export JSON
            </button>
            <button onClick={handleRegenerate} disabled={regenerating || isProcessing} className="btn-primary">
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              )}
              Regenerate
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
        )}

        {isProcessing && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-blue-50 p-4 text-blue-700">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            <span>AI is analyzing your code and generating test cases...</span>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Submitted Code / Spec</h2>
            <pre className="card overflow-auto max-h-[500px] font-mono text-xs text-slate-700 whitespace-pre-wrap bg-slate-900 text-slate-100 !border-slate-800">
              {project.input_data}
            </pre>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Generated Test Cases ({project.test_cases.length})
            </h2>
            <TestCaseList
              testCases={project.test_cases}
              onUpdate={async (tcId, data) => {
                await api.updateTestCase(tcId, data);
                await loadProject();
              }}
              onDelete={async (tcId) => {
                await api.deleteTestCase(tcId);
                await loadProject();
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
