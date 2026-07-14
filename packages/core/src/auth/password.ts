import { z } from 'zod';
import { base64UrlDecode, base64UrlEncode, randomBase64Url } from './crypto';

const encoder = new TextEncoder();
const ALGORITHM = 'pbkdf2-sha256';
const ITERATIONS = 310_000;
const HASH_BYTES = 32;
const SALT_BYTES = 16;

export const PasswordInput = z.string().min(8).max(128);

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!;
  return diff === 0;
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const saltBytes = new Uint8Array(salt);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBytes, iterations },
    key,
    HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const parsed = PasswordInput.parse(password);
  const salt = base64UrlDecode(randomBase64Url(SALT_BYTES));
  const hash = await pbkdf2(parsed, salt, ITERATIONS);
  return `${ALGORITHM}$${ITERATIONS}$${base64UrlEncode(salt)}$${base64UrlEncode(hash)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (password.length > 128) return false;

  const [algorithm, iterationsRaw, saltRaw, hashRaw] = storedHash.split('$');
  if (algorithm !== ALGORITHM || !iterationsRaw || !saltRaw || !hashRaw) return false;

  const iterations = Number(iterationsRaw);
  if (!Number.isInteger(iterations) || iterations < 1) return false;

  const expected = base64UrlDecode(hashRaw);
  const actual = await pbkdf2(password, base64UrlDecode(saltRaw), iterations);
  return timingSafeEqual(actual, expected);
}
