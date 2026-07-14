import type { ZodError } from 'zod';

export type FormErrors<T extends string> = Partial<Record<T | 'form', string>>;

export function field(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
}

export function validationErrors<T extends string>(error: ZodError): FormErrors<T> {
  const errors: FormErrors<T> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in errors)) errors[key as T] = issue.message;
  }
  return errors;
}
