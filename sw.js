// ============================================================
// PISOS CONNECT — SERVICE WORKER
// Cache de shell do app para funcionamento offline básico
// ============================================================

const CACHE_NAME = 'pisos-connect-v3';
const SHELL_ASSETS = [
    '/',
    '/index.html',
    '/login.html',
    '/registro-profissional.html',
    '/app/home.html',
    '/app/catalogo.html',
    '/app/produto.html',
    '/app/sacola.html',
    '/app/pedidos.html',
    '/app/profissionais.html',
    '/app/profissional.html',
    '/app/minha-loja.html',
    '/css/app.css',
    '/js/config.js',
    '/js/supabase.js',
    '/js/auth.js',
    '/manifest.json'
];

// Instalação — faz cache do shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Ativação — limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — Network first, cache fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Ignora requisições ao Supabase (sempre vai à rede)
    if (request.url.includes('supabase.co')) return;

    // Para navegação (HTML), usa Network First
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match(request) || caches.match('/index.html'))
        );
        return;
    }

    // Para assets estáticos, Cache First
    event.respondWith(
        caches.match(request)
            .then(cached => cached || fetch(request).then(response => {
                if (response.ok && response.type !== 'opaque') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(c => c.put(request, clone));
                }
                return response;
            }))
    );
});
