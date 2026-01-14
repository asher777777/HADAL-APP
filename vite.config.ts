import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  define: {
    // Inject process.env.API_KEY from the build environment (Hostinger)
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    // Prevent crash for other process.env accesses
    'process.env': {} 
  }
});