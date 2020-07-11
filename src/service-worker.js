const CURRENT_CACHE_VERSION = 9
const CURRENT_CACHE_NAME = `cache-v${CURRENT_CACHE_VERSION}`
const URLS_TO_CACHE = [
  '/',
  '/styles.css',
  '/icon.png',
  '/bundle.js',
  '/0.bundle.worker.js',
  'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.css',
  'https://cdnjs.cloudflare.com/ajax/libs/bootcards/1.1.2/css/bootcards-desktop.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.4/jquery.js',
  'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.js',
  'https://cdnjs.cloudflare.com/ajax/libs/bootcards/1.1.2/js/bootcards.js'
]

self.addEventListener('install', async () => {
  console.log('[service worker install]')
  const cache = await caches.open(CURRENT_CACHE_NAME)
  cache.addAll(URLS_TO_CACHE)
})

self.addEventListener('activate', async () => {
  console.log('[service worker activate]')
  const keys = await caches.keys()
  console.log(`[service worker activate] old caches: ${JSON.stringify(keys)}`)
  const promises = keys.map(key => {
    if (key != CURRENT_CACHE_NAME) {
      console.log(`[service worker activate] deleting old cache ${key}`)
      return caches.delete(key)
    }
  })
  return Promise.all(promises)
})

self.addEventListener('fetch', event =>
  event.respondWith(
    caches.match(event.request)
      .then(response => response ? response : fetch(event.request))))
