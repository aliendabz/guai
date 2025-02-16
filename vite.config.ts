import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ui: ['@radix-ui/react-select', '@radix-ui/react-slot', 'lucide-react', 'vaul'],
          vendor: ['react', 'react-dom', 'react-markdown', 'axios', 'sonner', 'tailwind-merge', 'tailwindcss-animate'],
        },
      },
    },
  },
})
