import { Head } from '@inertiajs/react';
import { SettingsCard } from '../../components/SettingsCard';
import { SettingsLayout } from '../../layouts/SettingsLayout';

interface ProfileProps {
  errors: Partial<Record<'name' | 'email' | 'form', string>>;
  old: { name: string; email: string };
  saved: boolean;
}

export default function Profile({ errors, old, saved }: ProfileProps) {
  return (
    <SettingsLayout>
      <Head title="Profile settings" />
      <SettingsCard title="Profile information" description="Update your name and email address.">
        {saved ? (
          <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Profile saved.
          </p>
        ) : null}

        {errors.form ? <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p> : null}

        <form method="post" action="/settings/profile" className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Name</span>
            <input
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={old.name}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {errors.name ? (
              <span className="mt-2 block text-sm text-red-600 dark:text-red-300">{errors.name}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Email address</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={old.email}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {errors.email ? (
              <span className="mt-2 block text-sm text-red-600 dark:text-red-300">{errors.email}</span>
            ) : null}
          </label>

          <button
            type="submit"
            className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Save
          </button>
        </form>
      </SettingsCard>
    </SettingsLayout>
  );
}
