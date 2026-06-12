import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid } from 'lucide-react';
import type { ReactNode } from 'react';

interface SharedProps {
  app: { name: string };
  auth: { user: string | null };
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
          <div className="text-xs text-slate-500">{props.auth.user ? `Session: ${props.auth.user}` : ''}</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
