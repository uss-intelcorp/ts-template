import { Head, Link } from '@inertiajs/react';

interface LoginProps {
  app: { name: string };
  errors: Partial<Record<'email' | 'password' | 'form', string>>;
  old: { email: string };
}

export default function Login({ app, errors, old }: LoginProps) {
  return (
    <main className="flex min-h-full items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <Head title="Log in" />
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-sky-950/40 backdrop-blur">
        <div>
          <p className="text-sm font-medium tracking-[0.3em] text-brand-300 uppercase">{app.name}</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">Log in with your email and password to continue.</p>
        </div>

        {errors.form ? <p className="mt-6 rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{errors.form}</p> : null}

        <form method="post" action="/login" className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={old.email}
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white ring-0 transition outline-none focus:border-brand-400"
            />
            {errors.email ? <span className="mt-2 block text-sm text-red-300">{errors.email}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-200">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white ring-0 transition outline-none focus:border-brand-400"
            />
            {errors.password ? <span className="mt-2 block text-sm text-red-300">{errors.password}</span> : null}
          </label>

          <button
            type="submit"
            className="shadow-brand-950/40 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-400"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{' '}
          <Link href="/register" className="font-medium text-brand-300 hover:text-brand-200">
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}
