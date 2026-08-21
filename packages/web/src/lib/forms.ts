import { z, type ZodError } from 'zod';

export type FormErrors<T extends string> = Partial<Record<T | 'form', string>>;

type FormBody = Record<string, string | File | (string | File)[]>;

interface ValidationErrors {
  [key: string]: string;
}

const FieldValue = z.union([z.string(), z.array(z.string())]);

export function field(body: FormBody, key: string): string {
  const value = FieldValue.safeParse(body[key]);
  if (!value.success) return '';
  return Array.isArray(value.data) ? (value.data[0] ?? '') : value.data;
}

export function validationErrors(error: ZodError) {
  const errors: ValidationErrors = {};
  for (const issue of error.issues) {
    const key = z.string().safeParse(issue.path[0]);
    if (key.success && !(key.data in errors)) errors[key.data] = issue.message;
  }
  return errors;
}
