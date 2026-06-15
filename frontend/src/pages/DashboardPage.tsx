import { useCallback, useEffect, useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ProjectCard } from '../components/ProjectCard';
import { api } from '../services/api';
import type { Project } from '../types';

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [inputData, setInputData] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadProjects = useCallback(async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    const interval = setInterval(loadProjects, 5000);
    return () => clearInterval(interval);
  }, [loadProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const project = await api.createProject(name, inputData);
      setProjects((prev) => [project, ...prev]);
      setShowForm(false);
      setName('');
      setInputData('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Your Projects</h1>
            <p className="mt-1 text-slate-600">Submit code or specifications to generate test cases</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Project
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        {showForm && (
          <form onSubmit={handleCreate} className="card mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Create New Project</h2>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Project Name</span>
              <input
                className="input-field mt-1.5"
                required
                placeholder="e.g. Login Feature Tests"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Code or Specification</span>
              <textarea
                className="input-field mt-1.5 min-h-[200px] font-mono text-xs"
                required
                placeholder="Paste your source code or feature specification here..."
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
              />
            </label>
            <div className="flex gap-3">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Generating...' : 'Generate Test Cases'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="card text-center py-16">
              <Sparkles className="mx-auto h-12 w-12 text-brand-300" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No projects yet</h3>
              <p className="mt-2 text-slate-600">Create your first project to start generating test cases</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-6">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
