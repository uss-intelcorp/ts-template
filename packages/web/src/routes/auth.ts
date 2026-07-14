import { Hono } from 'hono';
import type { Context } from 'hono';
import { User } from '@ts-template/core/user/index';
import type { Env } from '../server';
import { clearSessionCookie, createSessionCookie, redirectIfAuthenticated, requireAuth } from '../lib/auth';
import { field, type FormErrors, validationErrors } from '../lib/forms';
import { sharedProps } from '../lib/inertia';

type AuthErrors = FormErrors<'name' | 'email' | 'password' | 'passwordConfirmation'>;

function renderLogin(c: Context<{ Bindings: Env }>, props?: { errors?: AuthErrors; email?: string }) {
  return c.render('Login', {
    ...sharedProps(c),
    errors: props?.errors ?? {},
    old: { email: props?.email ?? '' },
  });
}

function renderRegister(c: Context<{ Bindings: Env }>, props?: { errors?: AuthErrors; name?: string; email?: string }) {
  return c.render('Register', {
    ...sharedProps(c),
    errors: props?.errors ?? {},
    old: { name: props?.name ?? '', email: props?.email ?? '' },
  });
}

export const authRoute = new Hono<{ Bindings: Env }>()
  .get('/login', redirectIfAuthenticated, (c) => renderLogin(c))
  .post('/login', redirectIfAuthenticated, async (c) => {
    const body = await c.req.parseBody();
    const input = {
      email: field(body, 'email'),
      password: field(body, 'password'),
    };
    const parsed = User.LoginInput.safeParse(input);
    if (!parsed.success) {
      c.status(422);
      return renderLogin(c, { errors: validationErrors(parsed.error), email: input.email });
    }

    const user = await User.verifyCredentials(parsed.data);
    if (!user) {
      c.status(422);
      return renderLogin(c, {
        errors: { email: 'These credentials do not match our records.' },
        email: input.email,
      });
    }

    await createSessionCookie(c, user);
    return c.redirect('/', 303);
  })
  .get('/register', redirectIfAuthenticated, (c) => renderRegister(c))
  .post('/register', redirectIfAuthenticated, async (c) => {
    const body = await c.req.parseBody();
    const input = {
      name: field(body, 'name'),
      email: field(body, 'email'),
      password: field(body, 'password'),
      passwordConfirmation: field(body, 'passwordConfirmation'),
    };
    const parsed = User.RegisterInput.safeParse(input);
    if (!parsed.success) {
      c.status(422);
      return renderRegister(c, {
        errors: validationErrors(parsed.error),
        name: input.name,
        email: input.email,
      });
    }

    if (await User.findByEmail(parsed.data.email)) {
      c.status(422);
      return renderRegister(c, {
        errors: { email: 'The email has already been taken.' },
        name: input.name,
        email: input.email,
      });
    }

    const user = await User.create(parsed.data);
    await createSessionCookie(c, user);
    return c.redirect('/', 303);
  })
  .post('/logout', requireAuth, async (c) => {
    await clearSessionCookie(c);
    return c.redirect('/login', 303);
  });
