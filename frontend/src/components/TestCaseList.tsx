import { useState } from 'react';
import { Pencil, Trash2, Save, X } from 'lucide-react';
import type { TestCase } from '../types';

interface TestCaseListProps {
  testCases: TestCase[];
  onUpdate: (id: number, data: Partial<TestCase>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TestCaseList({ testCases, onUpdate, onDelete }: TestCaseListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', expected_outcome: '' });

  const startEdit = (tc: TestCase) => {
    setEditingId(tc.id);
    setEditForm({
      title: tc.title,
      description: tc.description,
      expected_outcome: tc.expected_outcome,
    });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    await onUpdate(editingId, editForm);
    setEditingId(null);
  };

  if (testCases.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">No test cases generated yet. They will appear here once processing completes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="list" aria-label="Generated test cases">
      {testCases.map((tc, index) => (
        <article key={tc.id} className="card" role="listitem">
          {editingId === tc.id ? (
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  className="input-field mt-1"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Description / Test Steps</span>
                <textarea
                  className="input-field mt-1 min-h-[80px] font-mono text-xs"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Expected Outcome</span>
                <textarea
                  className="input-field mt-1 min-h-[60px]"
                  value={editForm.expected_outcome}
                  onChange={(e) => setEditForm({ ...editForm, expected_outcome: e.target.value })}
                />
              </label>
              <div className="flex gap-2">
                <button onClick={saveEdit} className="btn-primary !py-2">
                  <Save className="h-4 w-4" aria-hidden="true" /> Save
                </button>
                <button onClick={() => setEditingId(null)} className="btn-secondary !py-2">
                  <X className="h-4 w-4" aria-hidden="true" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-brand-600">TC-{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">{tc.title}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => startEdit(tc)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label={`Edit test case ${tc.title}`}
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this test case?')) onDelete(tc.id);
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Delete test case ${tc.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Test Steps</h4>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{tc.description}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Expected Result</h4>
                  <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{tc.expected_outcome}</p>
                </div>
              </div>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
