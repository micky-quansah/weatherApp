importScripts('./cache-polyfill.js');

let cacheName = 'weatherApp';

self.addEventListener('install', function(e) {
 e.waitUntil(
   caches.open(cacheName)
   .then(function(cache) {
     return cache.addAll([
       '/',
       '/index.html',
       '/logpage.html',
       '/site.webmanifest',
       '/styles/main.css',
       '/styles/logging_style.css',
       '/scripts/home.js',
       '/images/cloudweather-bg.png',
       '/images/omid-armin-jmSD8f-yJXg-unsplash.jpg',
       '/images/pero-kalimero-9BJRGlqoIUk-unsplash.jpg',
       '/android-chrome-192x192.png',
       '/android-chrome-384x384.png',
       '/apple-touch-icon.png',
       '/favicon.ico',
       '/favicon-16x16.png',
       '/favicon-32x32.png',
       '/mstile-150x150.png',
       '/safari-pinned-tab.svg'
     ]);
   })
   .then( () => self.skipWaiting())
 );
});

self.addEventListener('activate', (e) => {
    console.log('Service Worker: Activated');
    e.waitUntil(
        caches.keys().then(cacheName => {
            return Promise.all(
                cacheName.map( cache => {
                    if (cache !== cacheName){
                        console.log('Service Worker: Clearing old cache');
                        return caches.delete(cache);
                    }
                })
            )
        })
    )
})

self.addEventListener('fetch', function(e) {
    console.log(e.request.url);
    e.respondWith(
        fetch(e.request).catch( () => caches.match(e.request))
    );
   });