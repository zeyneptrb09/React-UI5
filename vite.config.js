import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });
console.log("vite dosyası" + process.env.VITE_API_URL);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/sap': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/sap/, '/sap')  // URL'yi yeniden yazdırmak için
      }
    }
  }
});
