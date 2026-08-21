import { createInertiaApp } from '@inertiajs/react';
import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/index.css';

const pages = import.meta.glob<{ default: React.ComponentType }>('./pages/**/*.tsx', {
  eager: false,
});

void createInertiaApp({
  resolve: async (name) => {
    const importer = pages[`./pages/${name}.tsx`];
    if (!importer) throw new Error(`Unknown Inertia page: ${name}`);
    const mod = await importer();
    return mod.default;
  },
  setup({ el, App, props }) {
    const tree = (
      <StrictMode>
        <App {...props} />
      </StrictMode>
    );
    if (el.hasChildNodes()) hydrateRoot(el, tree);
    else createRoot(el).render(tree);
  },
  progress: { color: '#0ea5e9', showSpinner: false },
}).catch((cause: unknown) => console.error('Failed to start Inertia app:', cause));
