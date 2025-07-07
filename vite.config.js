import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  root: '.',
  plugins: [
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'src-sw.js',
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      },
      registerType: 'autoUpdate',
      manifest: {
        name: 'Nama Aplikasi Kamu',
        short_name: 'Aplikasi',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b883',
        icons: [
          {
            src: '/assets/logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});