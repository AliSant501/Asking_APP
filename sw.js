const CACHE_NAME = 'game-cache-v1';
const ASSETS = [
    '/Asking_APP/',
    '/Asking_APP/index.html',
    '/Asking_APP/style.css',
    '/Asking_APP/script.js',
    '/Asking_APP/manifest.json',
    './Asking_APP/app-debug.apk',
    '/Asking_APP/click.mp3',
    '/Asking_APP/images/game-preview.jpg',
    '/Asking_APP/images/icon-192.png',
    '/Asking_APP/images/icon-512.png'
];

// Instalar el Service Worker y cachear los archivos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
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
        })
    );
});


// Interceptar peticiones y servir desde caché
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

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
