const CACHE_NAME = 'naldoa-cache-v3'; // Versão 3 para forçar a troca

self.addEventListener('install', (event) => {
  // Ativa o novo SW imediatamente sem esperar o antigo
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Deleta qualquer cache antigo (v1, v2, etc)
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Assume o controle de todas as abas imediatamente
      return self.clients.claim();
    })
  );
});

// Estratégia: Sempre tenta buscar da internet primeiro
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se buscar da internet com sucesso, salva no cache (para uso offline futuro)
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se estiver sem internet, usa o cache
        return caches.match(event.request);
      })
  );
});