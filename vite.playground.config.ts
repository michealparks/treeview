import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    target: 'esnext',
  },
  server: {
    fs: {
      allow: ['.'],
      strict: true,
    },
    strictPort: true,
  },
})
