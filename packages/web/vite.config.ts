import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import devServer, { defaultOptions } from '@hono/vite-dev-server';
import nodeAdapter from '@hono/vite-dev-server/node';
import { inertiaPages } from '@hono/inertia/vite';

export default defineConfig(({ command }) => {
  const isNodeTarget = process.env.VITE_TARGET === 'node';

  return {
    plugins: [
      react(),
      tailwindcss(),
      inertiaPages({
        pagesDir: 'src/pages',
        outFile: 'src/pages.gen.ts',
        serverModule: './server',
      }),
      ...(isNodeTarget
        ? command === 'serve'
          ? [
              devServer({
                adapter: nodeAdapter,
                entry: 'src/dev-entry.ts',
                injectClientScript: false,
                exclude: [/^\/favicon\.svg$/, ...defaultOptions.exclude],
              }),
            ]
          : []
        : [cloudflare({ persistState: { path: '../../.wrangler/state' } })]),
    ],
    build: {
      outDir: isNodeTarget ? 'dist/node-client' : 'dist/client',
      sourcemap: true,
    },
  };
});
