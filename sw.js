// MUDAMOS PARA V15 para ativar Notificações Push e Robô Diário
const CACHE_NAME = 'vandomotos-pwa-v15'; 

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

// 1. Instalação do Cache
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('📦 A guardar ficheiros na versão: ' + CACHE_NAME);
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting(); 
});

// 2. Limpeza da versão antiga
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

// 3. Carregamento Offline
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

// 4. A MAGIA: Clique na Notificação Push abre a App
self.addEventListener('notificationclick', event => {
    event.notification.close(); // Fecha o balão
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            // Se a app já estiver em 2º plano, puxa-a para o ecrã
            for (let client of windowClients) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Se estiver totalmente fechada, abre o sistema
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
