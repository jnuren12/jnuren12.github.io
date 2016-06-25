var dataCacheName = 'jeezhu-widgetData-v1'
var cacheName = 'jeezhu-webapp-v1'

self.addEventListener('install', e => {
  console.log('[Service Worker] :D Install')
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[Service Worker] :D Caching app shell')
      return cache.addAll([
        '/',
        '/index.html',
        '/index.html?homescreen=1',
        '/?homescreen=1',
        '/favicon.ico',
        '/style/app.css',
        '/js/app.js',
        '/images/icon-256x256.png',
        '/images/ic_refresh_white_24px.svg',
        '/images/ic_add_white_24px.svg'
      ])
      .then(() => self.skipWaiting())
    })
  )
})

self.addEventListener('activate', e => {
  console.log('[Service Worker] :D Activate')
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        console.log('[Service Worker] :D Removing old cache', key)
        if (key !== cacheName) {
          return caches.delete(key)
        }
      }))
    })
  )
})

self.addEventListener('fetch', e => {
  console.log('[Service Worker] :D Fetching', e.request.url)
  const url = new URL(e.request.url)
  var dataUrl = 'https://raw.githubusercontent.com/jnuren12/jnuren12.github.io/master/test/'

  if (url.origin === location.origin && url.pathname === '/') {
    e.respondWith(caches.match('/index.html'))
    return
  } else if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          return caches.open(dataCacheName).then(cache => {
            cache.put(e.request.url, response.clone())
            console.log('[Service Worker] :D Fetched & Cached Data')
            return response
          })
        })
    )
  } else {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request)
      })
    )
  }
})
