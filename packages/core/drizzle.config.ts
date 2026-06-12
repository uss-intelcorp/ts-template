import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/**/*.sql.ts',
  out: './migrations',
  dialect: 'sqlite',
});
