// MUDAMOS PARA V5 para forçar a descarga do compilador nativo de PDFs e layouts
const CACHE_NAME = 'vandomotos-pwa-v6'; 

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

// 1. Instalação: Guarda a nova versão no telemóvel
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('📦 A guardar ficheiros na versão: ' + CACHE_NAME);
            return cache.addAll(ASSETS);
        })
    );
    // Força a atualização a acontecer imediatamente, sem esperar que o cliente feche o App
    self.skipWaiting(); 
});

// 2. Ativação: O Varredor (Apaga a versão antiga)
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
    // Diz ao telemóvel para começar a usar a versão nova agora mesmo
    self.clients.claim();
});

// 3. Interceção: Serve os ficheiros muito rápido
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
