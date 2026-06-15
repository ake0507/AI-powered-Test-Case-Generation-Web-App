import { Link, useLocation } from 'react-router-dom';
import { FlaskConical, LayoutDashboard, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLink = (to: string, label: string, icon: React.ReactNode) => (
    <Link
      to={to}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
        location.pathname.startsWith(to)
          ? 'bg-brand-50 text-brand-700'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
      aria-current={location.pathname.startsWith(to) ? 'page' : undefined}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex items-center gap-2.5" aria-label="TestGen AI home">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold text-slate-900">TestGen AI</span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {navLink('/dashboard', 'Dashboard', <LayoutDashboard className="h-4 w-4" aria-hidden="true" />)}
          {user?.role === 'admin' &&
            navLink('/admin', 'Admin', <Shield className="h-4 w-4" aria-hidden="true" />)}
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-slate-600 sm:block">{user?.name}</span>
          <button
            onClick={() => logout()}
            className="btn-secondary !py-2 !px-3"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
