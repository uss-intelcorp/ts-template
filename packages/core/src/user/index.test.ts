import { describe, expect, it } from 'vitest';
import { User } from './index';

describe('User', () => {
  it('normalizes registration input', () => {
    expect(
      User.RegisterInput.parse({
        name: ' Jane Developer ',
        email: ' JANE@EXAMPLE.COM ',
        password: 'password-secret',
        passwordConfirmation: 'password-secret',
      }),
    ).toEqual({
      name: 'Jane Developer',
      email: 'jane@example.com',
      password: 'password-secret',
      passwordConfirmation: 'password-secret',
    });
  });

  it('rejects mismatched password confirmation', () => {
    expect(() =>
      User.RegisterInput.parse({
        name: 'Jane Developer',
        email: 'jane@example.com',
        password: 'password-secret',
        passwordConfirmation: 'different-secret',
      }),
    ).toThrow('Passwords do not match.');
  });

  it('normalizes login email', () => {
    expect(User.LoginInput.parse({ email: ' JANE@EXAMPLE.COM ', password: 'secret' })).toEqual({
      email: 'jane@example.com',
      password: 'secret',
    });
  });

  it('normalizes profile input', () => {
    expect(User.ProfileInput.parse({ userId: 1, name: ' Jane Developer ', email: ' JANE@EXAMPLE.COM ' })).toEqual({
      userId: 1,
      name: 'Jane Developer',
      email: 'jane@example.com',
    });
  });

  it('requires the current password when changing passwords', () => {
    expect(() =>
      User.PasswordUpdateInput.parse({
        userId: 1,
        currentPassword: '',
        password: 'new-password-secret',
        passwordConfirmation: 'new-password-secret',
      }),
    ).toThrow();
  });

  it('rejects mismatched password updates', () => {
    expect(() =>
      User.PasswordUpdateInput.parse({
        userId: 1,
        currentPassword: 'current-password-secret',
        password: 'new-password-secret',
        passwordConfirmation: 'different-password-secret',
      }),
    ).toThrow('Passwords do not match.');
  });
});
