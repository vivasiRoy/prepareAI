// Minimal service worker: enables PWA installability. Network-first with a
// tiny offline fallback for navigations; static assets pass through.
const CACHE = 'prepareai-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  // Never intercept API or auth traffic
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok && (request.destination === 'style' || request.destination === 'script' || request.destination === 'image' || request.destination === 'font')) {
          const copy = response.clone()
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {})
        }
        return response
      })
      .catch(() => caches.match(request).then(hit => hit || new Response(
        '<!doctype html><meta charset="utf-8"><title>Offline</title><body style="background:#09090f;color:#e5e7eb;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:40px">⚡</div><h1 style="font-size:18px">You\'re offline</h1><p style="color:#6b7280;font-size:14px">PrepareAI needs a connection. We\'ll be here when you\'re back.</p></div>',
        { headers: { 'Content-Type': 'text/html' } }
      )))
  )
})
