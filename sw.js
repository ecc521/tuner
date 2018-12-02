//Name of cache to use
const cachename = "tuner"


//NOT YET IMPLEMENTED

//Caches that should not be cleared. Note that cachename is automatically added
const keepcaches = []

//Prefix that will be added to cachename.
//Caches without this prefix will not be modified
const prefix = ""

//Array of URL's that should be preloaded IF POSSIBLE (will continue if not preloaded)
const preloadurls = []

//END OF NOT YET IMPLEMENTED

//Milliseconds to wait for network response before using cache
const waitperiod = 2000




self.addEventListener("fetch", fetchevent)
self.addEventListener("activate", activateevent)

function fetchevent(event) {
    event.respondWith((async function(){
        let fromnetwork = fetch(event.request)
        let cache = await caches.open(cachename)

        let url = event.request.url
        let end = url.indexOf("?")
        if (end === -1) {end = url.length}
        url = url.slice(0, end) //Eliminate Query Parameter
          
        let fromcache = await caches.match(url)
            
            
        if (!fromcache) {
            //No cache. All we can do is return network response
            let response = await fromnetwork
            cache.put(url, response.clone())
            return response
        }
        else {
                
            //We have cached data
            return new Promise(function(resolve, reject){
                    
                //Fetch from network and update cache
                fromnetwork.then(function(response){
                    console.log(url + " has been loaded from the network")
                    cache.put(url, response.clone())
                    console.log(url + " has been put into cache")
                    resolve(response)
                })
                    
                //If the fetch event fails (ex. offline), return cached immediately
                fromnetwork.catch(function(e){
                    console.log(url + " errored when fetching from network. Using cache")
                    resolve(fromcache)
                })
                    
                    //If the network doesn't respond quickly enough, use cached data
                    setTimeout(function(){
                        console.log(url + " took too long to load from network. Using cache")
                        resolve(fromcache)
                    }, waitperiod)
                })  
            }
    }()))
}


function activateevent() {
    
    

}
