import { Link } from 'react-router-dom';
import { Calendar, FileCode2, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import type { Project } from '../types';

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-600 bg-amber-50', label: 'Pending' },
  processing: { icon: Loader2, color: 'text-blue-600 bg-blue-50', label: 'Processing' },
  completed: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50', label: 'Completed' },
  failed: { icon: AlertCircle, color: 'text-red-600 bg-red-50', label: 'Failed' },
};

interface ProjectCardProps {
  project: Project;
  onDelete: (id: number) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const status = statusConfig[project.status] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <article className="card group transition hover:shadow-md hover:border-brand-200">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="text-lg font-semibold text-slate-900 hover:text-brand-600 transition"
          >
            {project.name}
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              <StatusIcon className={`h-3.5 w-3.5 ${project.status === 'processing' ? 'animate-spin' : ''}`} aria-hidden="true" />
              {status.label}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileCode2 className="h-3.5 w-3.5" aria-hidden="true" />
              {project.test_case_count ?? 0} test cases
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              {new Date(project.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            if (confirm('Delete this project and all its test cases?')) {
              onDelete(project.id);
            }
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-red-600 opacity-0 transition hover:bg-red-50 group-hover:opacity-100 focus:opacity-100"
          aria-label={`Delete project ${project.name}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
