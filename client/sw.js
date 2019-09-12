var CACHE = 'network-or-cache';

var urlsToCache = ['/index.html',
  'LocationForm.html'];

function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(urlsToCache);
  });
}

self.addEventListener('install', function (evt) {
  console.log('The service worker is being installed.');
  evt.waitUntil(precache());
});

self.addEventListener('fetch', function (event) {
  if (!(navigator.onLine) && event.request.url == 'http://localhost/login.aspx') {
    event.respondWith(
      caches.match('/home.aspx')
        .then(function (response) {
          // Cache hit - return response
          if (response) {
            console.log("Returning Home page : ")
            return response;
          }
        })
    );
  }
  else {
    console.log(" fetching : " + event.request.url)
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          // Cache hit - return response
          if (response) {
            console.log("Matched : " + event.request.url)
            return response;
          }
          console.log("Not Matched : " + event.request.url)
          return fetch(event.request);
        }
        ));
  }
});

self.addEventListener("push", e => {
  const data = e.data.json();
  console.log("Push Recieved...");
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.iconUrl
  });
});


self.addEventListener('sync', function (event) {
  if (event.tag == "oneTimeSync") {
    console.log("One Time Sync Fired");
  }
});
