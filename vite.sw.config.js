import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: [
        {
          find: '@',
          replacement: resolve(__dirname, 'src'),
        },
      ],
    },
    build: {
      watch: true,
      rollupOptions: {
        input: {
          'service-worker': resolve(__dirname, 'src/sw/index.ts'),
        },
      },
    },
  };
});
