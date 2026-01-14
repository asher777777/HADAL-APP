import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // This allows the code to access process.env.API_KEY without crashing in the browser
    // In Hostinger, you must set the environment variable in the dashboard.
    'process.env': {} 
  }
});