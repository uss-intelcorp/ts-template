import { Hono } from 'hono';
import type { Context } from 'hono';
import { User } from '@ts-template/core/user/index';
import { field, type FormErrors, validationErrors } from '../lib/forms';
import { sharedProps } from '../lib/inertia';
import type { Env } from '../server';

type ProfileErrors = FormErrors<'name' | 'email'>;
type SecurityErrors = FormErrors<'currentPassword' | 'password' | 'passwordConfirmation'>;

function currentUser(c: Context<{ Bindings: Env }>): User.Public {
  const user = c.get('user');
  if (!user) throw new Error('Authenticated user missing from protected settings route.');
  return user;
}

function renderProfile(
  c: Context<{ Bindings: Env }>,
  props?: { errors?: ProfileErrors; saved?: boolean; name?: string; email?: string },
) {
  const user = currentUser(c);
  return c.render('settings/Profile', {
    ...sharedProps(c),
    errors: props?.errors ?? {},
    saved: props?.saved ?? false,
    old: { name: props?.name ?? user.name, email: props?.email ?? user.email },
  });
}

function renderSecurity(c: Context<{ Bindings: Env }>, props?: { errors?: SecurityErrors; saved?: boolean }) {
  return c.render('settings/Security', {
    ...sharedProps(c),
    errors: props?.errors ?? {},
    saved: props?.saved ?? false,
    twoFactor: {
      enabled: currentUser(c).twoFactorEnabled,
      available: false,
    },
  });
}

export const settingsRoute = new Hono<{ Bindings: Env }>()
  .get('/settings', (c) => c.redirect('/settings/profile', 303))
  .get('/settings/profile', (c) => renderProfile(c))
  .post('/settings/profile', async (c) => {
    const user = currentUser(c);
    const body = await c.req.parseBody();
    const input = {
      userId: user.id,
      name: field(body, 'name'),
      email: field(body, 'email'),
    };
    const parsed = User.ProfileInput.safeParse(input);

    if (!parsed.success) {
      c.status(422);
      return renderProfile(c, {
        errors: validationErrors(parsed.error),
        name: input.name,
        email: input.email,
      });
    }

    const existing = await User.findByEmail(parsed.data.email);
    if (existing && existing.id !== user.id) {
      c.status(422);
      return renderProfile(c, {
        errors: { email: 'The email has already been taken.' },
        name: input.name,
        email: input.email,
      });
    }

    const updated = await User.updateProfile(parsed.data);
    if (!updated) return c.text('User not found', 404);

    c.set('user', updated);
    return renderProfile(c, { saved: true });
  })
  .get('/settings/security', (c) => renderSecurity(c))
  .post('/settings/password', async (c) => {
    const user = currentUser(c);
    const body = await c.req.parseBody();
    const input = {
      userId: user.id,
      currentPassword: field(body, 'currentPassword'),
      password: field(body, 'password'),
      passwordConfirmation: field(body, 'passwordConfirmation'),
    };
    const parsed = User.PasswordUpdateInput.safeParse(input);

    if (!parsed.success) {
      c.status(422);
      return renderSecurity(c, { errors: validationErrors(parsed.error) });
    }

    if (!(await User.updatePassword(parsed.data))) {
      c.status(422);
      return renderSecurity(c, { errors: { currentPassword: 'The current password is incorrect.' } });
    }

    return renderSecurity(c, { saved: true });
  });
