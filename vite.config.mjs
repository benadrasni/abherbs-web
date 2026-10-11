import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite's production build turns module.exports into named ESM exports.
// The dev server serves a project .cjs file as-is, so the named import in
// src/api.js has nothing to bind. Rewrite that one assignment while serving.
function taxonNamesDev() {
  const assignment = 'module.exports = { taxonNames, taxonVernaculars, taxonLabel };';
  return {
    name: 'taxon-names-cjs',
    apply: 'serve',
    transform(code, id) {
      const file = id.split('?')[0];
      if (!file.endsWith('/taxonNames.cjs') || !code.includes(assignment)) return null;
      return code.replace(assignment, 'export { taxonNames, taxonVernaculars, taxonLabel };');
    },
  };
}

export default defineConfig({
  plugins: [
    taxonNamesDev(),
    react(),
  ],
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
