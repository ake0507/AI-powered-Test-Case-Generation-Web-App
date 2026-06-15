import { Link } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-bold">TestGen AI</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary">Sign in</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
          AI-Powered Test Case<br />
          <span className="text-brand-600">Generation</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Submit your source code or feature specifications and get comprehensive test cases
          with descriptions and expected outcomes in seconds. Built for developers and QA engineers.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link to="/register" className="btn-primary text-base !px-8 !py-3">Start Free</Link>
          <Link to="/login" className="btn-secondary text-base !px-8 !py-3">Sign In</Link>
        </div>

        <div className="mt-24 grid gap-8 sm:grid-cols-3 text-left">
          {[
            { title: 'Submit Code or Specs', desc: 'Paste source code or write feature requirements in plain text.' },
            { title: 'AI Analysis', desc: 'Our engine analyzes functions, classes, APIs, and requirements to generate tests.' },
            { title: 'Review & Export', desc: 'Edit, delete, and export test cases as JSON for your CI/CD pipeline.' },
          ].map((feature) => (
            <div key={feature.title} className="card">
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
