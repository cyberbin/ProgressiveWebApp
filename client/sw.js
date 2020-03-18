var CACHE = 'network-or-cache';

var urlsToCache = ['/index.html', '/',
  '/LocationForm.html',
  '/internetError.html',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
  'js/main.js',
  'https://code.jquery.com/jquery-3.3.1.slim.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js'

];


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
    console.log(" includes online : " + event.request.url.includes('online.html'))
    console.log(" includes grid : " + event.request.url.includes('grid.html'))
    console.log(" online : " + navigator.onLine)
  if ((event.request.url.includes('online.html') || event.request.url.includes('grid.html')) && 
     !navigator.onLine) {
    event.respondWith(
      caches.match('/internetError.html')
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          console.log("Returning 404 page : ")
          return response;
        }
      })
    );
  } else {
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
      }));
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
    openDatabaseAndSyncLocations();
  }
});

var idbDatabase;
var IDB_VERSION = 1;
var STOP_RETRYING_AFTER = 86400000; // One day, in milliseconds.
var STORE_NAME = 'location';


function openDatabaseAndSyncLocations() {
  var indexedDBOpenRequest = indexedDB.open('locations', IDB_VERSION);

  indexedDBOpenRequest.onerror = function (error) {
    console.error('IndexedDB error:', error);
  };

  indexedDBOpenRequest.onupgradeneeded = function () {
    this.result.createObjectStore(STORE_NAME, {
      keyPath: 'fname'
    });
  };

  indexedDBOpenRequest.onsuccess = function () {
    idbDatabase = this.result;
    syncLocations();
  };
}

// Helper method to get the object store that we care about.
function getObjectStore(storeName, mode) {
  return idbDatabase.transaction(storeName, mode).objectStore(storeName);
}

function syncLocations() {
  var savedRequests = [];

  getObjectStore(STORE_NAME).openCursor().onsuccess = function (event) {
    // See https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#Using_a_cursor
    var cursor = event.target.result;

    if (cursor) {
      savedRequests.push(cursor.value);
      cursor.continue();
    } else {
      savedRequests.forEach(function (savedRequest) {
        let data = {
          "firstname": savedRequest.fname,
          "lastname": savedRequest.lname,
          "contact": savedRequest.pno,
          "remarks": savedRequest.remarks
        }
        const url = '/locations';
        fetch(url, {
          method: 'POST',
          body: JSON.stringify(data),
          headers: {
            "content-type": "application/json"
          }
        }).then(function () {
          console.log("Submitted");
        });

      });
    }
  };
}

// Open the IndexedDB and check for requests to replay each time the service worker starts up.
// Since the service worker is terminated fairly frequently, it should start up again for most
// page navigations. It also might start up if it's used in a background sync or a push
// notification context.
//openDatabaseAndSyncLocations();