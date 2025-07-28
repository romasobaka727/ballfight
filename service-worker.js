const CACHE_NAME = 'ball-fight-cache-v1';
const urlsToCache = [
  '/', // Кэшируем корневой путь
  '/index.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/icon-192x192.png', // Твои иконки
  '/icon-512x512.png'  // Твои иконки
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов и выдача из кэша
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если ответ есть в кэше, возвращаем его
        if (response) {
          return response;
        }
        // В противном случае, делаем запрос к сети
        return fetch(event.request);
      })
  );
});

// Активация Service Worker и удаление старых кэшей
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // Удаляем старые кэши
          }
        })
      );
    })
  );
});