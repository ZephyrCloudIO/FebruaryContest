import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { withZephyr } from 'vite-plugin-zephyr';
export default defineConfig({
  plugins: [react(), withZephyr(),],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
