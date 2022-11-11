import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    minify: true,
    target: 'esnext',
    lib: {
      entry: 'src/main.ts',
      name: 'TREEVIEW',
      fileName: 'main'
    }
  },
})
