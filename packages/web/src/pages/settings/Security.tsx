import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { SettingsCard } from '../../components/SettingsCard';
import { SettingsLayout } from '../../layouts/SettingsLayout';

interface SecurityProps {
  errors: Partial<Record<'currentPassword' | 'password' | 'passwordConfirmation' | 'form', string>>;
  saved: boolean;
  twoFactor: { enabled: boolean; available: boolean };
}

export default function Security({ errors, saved, twoFactor }: SecurityProps) {
  return (
    <SettingsLayout>
      <Head title="Security settings" />
      <SettingsCard title="Update password" description="Ensure your account is using a long, random password.">
        {saved ? (
          <p className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            Password updated.
          </p>
        ) : null}

        {errors.form ? <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p> : null}

        <form method="post" action="/settings/password" className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Current password</span>
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {errors.currentPassword ? (
              <span className="mt-2 block text-sm text-red-600 dark:text-red-300">{errors.currentPassword}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">New password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {errors.password ? (
              <span className="mt-2 block text-sm text-red-600 dark:text-red-300">{errors.password}</span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirm password</span>
            <input
              name="passwordConfirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 transition outline-none focus:border-brand-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            {errors.passwordConfirmation ? (
              <span className="mt-2 block text-sm text-red-600 dark:text-red-300">{errors.passwordConfirmation}</span>
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

      <SettingsCard
        title="Two-factor authentication"
        description="Add an authenticator app challenge before sensitive account access."
      >
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <div className="dark:bg-brand-950 flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:text-brand-200">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {twoFactor.enabled
                    ? 'Two-factor authentication is enabled.'
                    : 'Two-factor authentication is not enabled.'}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  The user schema includes Laravel-compatible 2FA columns. The setup ceremony is intentionally left as
                  an affordance until authenticator QR codes and recovery-code confirmation are implemented.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={!twoFactor.available}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 opacity-70 dark:border-slate-700 dark:text-slate-400"
            >
              Enable 2FA
            </button>
          </div>
        </div>
      </SettingsCard>
    </SettingsLayout>
  );
}
