// MUDAMOS PARA V3 para forçar o telemóvel a puxar o logotipo grande
const CACHE_NAME = 'vandomotos-pwa-v4'; 

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

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('📦 A guardar ficheiros na versão: ' + CACHE_NAME);
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting(); 
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('🧹 A limpar versão antiga do Cache: ' + cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
