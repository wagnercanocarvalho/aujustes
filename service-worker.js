const CACHE_NAME = 'IMVR-Cad V-1.0';
const urlsToCache = [
  '/',
  '/index_.html',
  '/manifest.json',
  '/assets/icone-48x48.png',
  '/assets/icone-72x72.png',
  '/assets/icone-96x96.png',
  '/assets/icone-144x144.png',
  '/assets/icone-192x192.png',
  '/assets/icone-512x512.png',
  '/css/styles.css',
  '/css/cadastro_rural.css',
  '/css/autorizacao_sem_exclusividade.css',
  '/html/cadastro/autorizacao_sem_exclusividade.html',
  '/html/cadastro/cadatro_rural.html',
  '/html/imoveis/busca_sncr.html',
  '/html/camera/images',
  '/html/camera/index.js',
  '/html/camera/index.html',
  '/html/camera/camera.js',
  '/html/camera/camera.html',
  '/html/camera/camera.css',
  '/html/camera/.gitattributes',
  '/html/geo/index.html',
  '/html/geo/azimute.html',
  '/html/imoveis/busca_sncr.html',
  '/html/imoveis/consultar.html',
  '/js/cadatro/cadastro_rural.js',
  '/js/geo/app.js',
  '/js/app.js',
  '/js/index.js',
  '/js/index_cam.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});