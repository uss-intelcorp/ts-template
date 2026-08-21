import { Head, router } from '@inertiajs/react';
import type { PageProps } from '@hono/inertia';
import { AppLayout } from '../layouts/AppLayout';
import { StatusCard } from '../components/StatusCard';

export default function Dashboard({ status, recentChecks }: PageProps<'Dashboard'>) {
  return (
    <AppLayout>
      <Head title="Dashboard" />
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TypeScript App Template</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Hono + Inertia + React, backed by Drizzle over D1/libSQL and ready for Node, Workers, and PM2.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatusCard label="API" value={status.ok ? 'OK' : 'Down'} hint={status.timestamp} />
          <StatusCard label="Runtime" value="Hono" hint="Single server definition" />
          <StatusCard label="Database" value="Drizzle" hint="Context via AsyncLocalStorage" />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Recent Health Checks</h2>
              <p className="text-sm text-slate-500">Starter table and route wiring for domain modules.</p>
            </div>
            <button
              type="button"
              onClick={() => router.post('/api/health-checks', { source: 'dashboard', message: 'manual check' })}
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Record Check
            </button>
            <button
              type="button"
              onClick={() => router.post('/api/health-checks/queued', { source: 'queue', message: 'queued check' })}
              className="dark:bg-brand-950 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 dark:border-brand-900 dark:text-brand-200"
            >
              Queue Check
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/40">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Source</th>
                  <th className="px-3 py-2 text-left font-medium">Message</th>
                  <th className="px-3 py-2 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentChecks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-slate-500">
                      No checks recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentChecks.map((check) => (
                    <tr key={check.id}>
                      <td className="px-3 py-2 font-medium">{check.source}</td>
                      <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{check.message}</td>
                      <td className="px-3 py-2 text-slate-500">{check.createdAt}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
