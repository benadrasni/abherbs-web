import { defineConfig, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    {
      name: 'js-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!/\/src\/.*\.js$/.test(id)) return null;
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'transform',
        });
      },
    },
    react({
      jsxRuntime: 'classic',
      include: '**/*.{js,jsx}',
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
