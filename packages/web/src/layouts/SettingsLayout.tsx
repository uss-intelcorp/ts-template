import { Link, usePage } from '@inertiajs/react';
import { LockKeyhole, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppLayout } from './AppLayout';

const settingsNav = [
  { href: '/settings/profile', label: 'Profile', description: 'Name and email', Icon: UserRound },
  { href: '/settings/security', label: 'Security', description: 'Password and 2FA', Icon: LockKeyhole },
];

export function SettingsLayout({ children }: { children: ReactNode }) {
  const { url } = usePage();

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium tracking-[0.25em] text-brand-600 uppercase dark:text-brand-300">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Manage your profile, password, and account security preferences.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
          <aside>
            <nav aria-label="Settings" className="grid gap-2">
              {settingsNav.map(({ href, label, description, Icon }) => {
                const active = url.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                      active
                        ? 'dark:bg-brand-950 border-brand-200 bg-brand-50 text-brand-900 shadow-sm dark:border-brand-900 dark:text-brand-100'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>
                      <span className="block font-medium">{label}</span>
                      <span className="block text-xs opacity-75">{description}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="max-w-2xl space-y-8">{children}</section>
        </div>
      </div>
    </AppLayout>
  );
}
