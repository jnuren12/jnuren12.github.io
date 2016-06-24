var dataCacheName = 'jeezhu-widgetData-v1'
var cacheName = 'jeezhu-webapp-v1'
var filesToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/style/app.css',
  '/js/app.js',
  '/images/icon-256x256.png',
  '/images/ic_refresh_white_24px.svg',
  '/images/ic_add_white_24px.svg'
]

self.addEventListener('install', function (e) {
  console.log('[Service Worker] :D Install')
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      console.log('[Service Worker] :D Caching app shell')
      return cache.addAll(filesToCache)
    })
  )
})

self.addEventListener('activate', function (e) {
  console.log('[Service Worker] :D Activate')
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        console.log('[Service Worker] :D Removing old cache', key)
        if (key !== cacheName) {
          return caches.delete(key)
        }
      }))
    })
  )
})

self.addEventListener('fetch', function (e) {
  console.log('[Service Worker] :D Fetching', e.request.url)
  const url = new URL(e.request.url)
  var dataUrl = 'https://raw.githubusercontent.com/jnuren12/jnuren12.github.io/master/test/'

  if (url.origin === location.origin && url.pathname === '/') {
    e.respondWith(caches.match('/index.html'))
    return
  }

  if (e.request.url.indexOf(dataUrl) === 0) {
    e.respondWith(
      fetch(e.request)
        .then(function (response) {
          return caches.open(dataCacheName).then(function (cache) {
            cache.put(e.request.url, response.clone())
            console.log('[Service Worker] :D Fetched & Cached Data')
            return response
          })
        })
    )
    return
  }

  e.respondWith(
    caches.match(e.request).then(function (response) {
      return response || fetch(e.request)
    })
  )
})
