const CACHE_NAME = "treppenlesen-v1";


const FILES_TO_CACHE = [

    "index.html",
    "style.css",
    "app.js",
    "words.js",
    "manifest.json"

];



// Installation

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

});




// Dateien aus Cache laden

self.addEventListener("fetch", event => {


    event.respondWith(

        caches.match(event.request)
        .then(response => {

            return response || fetch(event.request);

        })

    );


});




// Alte Versionen entfernen

self.addEventListener("activate", event => {


    event.waitUntil(

        caches.keys()
        .then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        return caches.delete(key);

                    }

                })

            );

        })

    );


});