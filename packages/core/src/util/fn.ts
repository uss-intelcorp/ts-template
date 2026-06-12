import type { z } from 'zod';

export function fn<T extends z.ZodType, R>(schema: T, cb: (input: z.infer<T>) => R) {
  const wrapped = (input: z.infer<T>): R => cb(schema.parse(input));
  wrapped.force = (input: z.infer<T>): R => cb(input);
  wrapped.schema = schema;
  return wrapped;
}
