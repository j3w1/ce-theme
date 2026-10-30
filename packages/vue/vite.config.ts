import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

// Library build: Vue stays external; the recipe helpers (price.mjs, product.mjs) are bundled so the package is self-contained.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index' },
    rollupOptions: { external: ['vue'] },
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
