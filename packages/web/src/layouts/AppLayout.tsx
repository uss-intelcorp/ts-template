import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';

interface SharedProps {
  app: { name: string };
  auth: { user: { name: string; email: string } | null };
  [key: string]: unknown;
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { props } = usePage<SharedProps>();

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-900/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <LayoutGrid className="size-5 text-brand-600" />
            {props.app.name}
          </Link>
          {props.auth.user ? (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <Link
                href="/settings/profile"
                className="font-medium text-slate-700 hover:text-brand-700 dark:text-slate-300"
              >
                {props.auth.user.name}
              </Link>
              <span>{props.auth.user.email}</span>
              <form method="post" action="/logout">
                <button type="submit" className="font-medium text-slate-700 hover:text-brand-700 dark:text-slate-300">
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-xs font-medium text-slate-700 hover:text-brand-700 dark:text-slate-300">
              Log in
            </Link>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
