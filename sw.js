const CACHE_NAME = 'game-cache-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './app-debug',
    './click.mp3',
    './images/game-preview.jpg',
    './images/icon-192.png',
    './images/icon-512.png'
];

// Instalar el Service Worker y cachear los archivos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS).catch(error => {
                console.error('Error cacheando archivos:', error);
            });
        })
    );
});

// Activar el Service Worker y limpiar caché antigua
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim()) // Toma control de las páginas abiertas
    );
});

// Interceptar peticiones y servir desde caché o red
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes("firebaseio.com")) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return new Response(JSON.stringify({ error: "No hay conexión a internet" }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(response => response || fetch(event.request))
        );
    }
});


