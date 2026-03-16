import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@cloudbase/js-sdk'],
  },
  build: {
    commonjsOptions: {
      include: [/@cloudbase/, /node_modules/],
    },
  },
})
