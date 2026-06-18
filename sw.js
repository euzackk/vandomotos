const CACHE_NAME = 'vandomotos-pwa-v1';
const ASSETS = [
    './',
    './index.html',
    './assets/css/style.css',
    './assets/img/logo.png',
    './src/app.js',
    './src/db.js',
    './src/clientes.js',
    './src/veiculos.js',
    './src/contratos.js',
    './src/financeiro.js'
];

// Instalação do Service Worker (Guarda os ficheiros no Cache do celular)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Ficheiros em cache para modo offline/rápido');
            return cache.addAll(ASSETS);
        })
    );
});

// Interceta os pedidos para acelerar o carregamento
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
