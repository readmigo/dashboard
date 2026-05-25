import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3001,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('react-admin') || id.includes('/ra-')) return 'react-admin';
          if (id.includes('@mui') || id.includes('@emotion')) return 'mui';
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'charts';
          return 'vendor';
        },
      },
    },
  },
});
