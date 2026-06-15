import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { BarChart3, Users, FolderOpen, FileCheck } from 'lucide-react';

export function AdminPage() {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'));
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats?.users ?? '-', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Projects', value: stats?.projects ?? '-', icon: FolderOpen, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Test Cases Generated', value: stats?.test_cases ?? '-', icon: FileCheck, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-brand-600" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        </div>
        <p className="mt-1 text-slate-600">System usage and health metrics</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{error}</div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className="card">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{card.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{String(card.value)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {stats?.projects_by_status && (
          <div className="card mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Projects by Status</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {Object.entries(stats.projects_by_status as Record<string, number>).map(([status, count]) => (
                <div key={status} className="rounded-lg bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <p className="text-sm capitalize text-slate-500">{status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
