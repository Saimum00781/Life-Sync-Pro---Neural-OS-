import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(), 
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          injectRegister: 'auto',
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg}']
          },
          includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
          manifest: {
            name: 'Life Sync Pro - Neural OS',
            short_name: 'LifeSync',
            description: 'Peak-performance cognitive management ecosystem',
            theme_color: '#0a0000',
            background_color: '#0a0000',
            display: 'standalone',
            display_override: ['window-controls-overlay', 'standalone'],
            orientation: 'portrait',
            icons: [
              {
                src: 'icon.svg',
                sizes: '192x192 512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
              }
            ],
            screenshots: [
              {
                src: 'screenshot-desktop.svg',
                sizes: '1920x1080',
                type: 'image/svg+xml',
                form_factor: 'wide'
              },
              {
                src: 'screenshot.svg',
                sizes: '1080x1920',
                type: 'image/svg+xml',
                form_factor: 'narrow'
              }
            ],
            shortcuts: [
              {
                name: 'Today View',
                short_name: 'Today',
                description: 'Open Today View',
                url: '/',
                icons: [{ src: 'icon.svg', sizes: '192x192' }]
              }
            ]
          }
        })
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
