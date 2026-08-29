import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Fuerza builds de desarrollo de React 19 para evitar "React.act is not a function".
    'process.env.NODE_ENV': '"development"',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    server: {
      deps: {
        inline: ['react', 'react-dom', 'react-dom/test-utils'],
      },
    },
  },
});
