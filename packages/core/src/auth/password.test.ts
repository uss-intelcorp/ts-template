import { describe, expect, it } from 'vitest';
import { hashPassword, PasswordInput, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('correct horse battery staple');

    expect(hash).toMatch(/^pbkdf2-sha256\$310000\$/u);
    expect(hash).not.toContain('correct horse battery staple');
    await expect(verifyPassword('correct horse battery staple', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong password', hash)).resolves.toBe(false);
  });

  it('requires at least eight characters', () => {
    expect(() => PasswordInput.parse('short')).toThrow();
  });
});
