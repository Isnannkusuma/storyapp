// workbox-config.js
module.exports = {
  globDirectory: 'public/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,ico,json}'
  ],
  swSrc: 'public/src-sw.js',      // <--- ini penting!
  swDest: 'public/service-worker.js',
  runtimeCaching: [
    // Cache API cerita (NetworkFirst)
    {
      urlPattern: /^https:\/\/story-api\.dicoding\.dev\/v1\/stories/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'stories-api-cache',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 hari
        },
      },
    },
    // Cache gambar (CacheFirst)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'image-cache',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 1 minggu
        },
      },
    },
    // Cache file JS, CSS (StaleWhileRevalidate)
    {
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
    // Cache halaman HTML (NetworkFirst)
    {
      urlPattern: /\.html$/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'html-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 24 * 60 * 60,
        },
      },
    },
  ],
};