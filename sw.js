//Updating this shortly
self.addEventListener("fetch", function(event){
  event.respondWith(fetch(event.request))
})
