if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/tuner/sw.js');
}


function setpage(url) {
  //Clear open content
  let elems = document.querySelectorAll(".maincontent")
  for (let i=0;i<elems.length;i++) {
    console.log(elems[i])
    elems[i].remove()
  }
  
  let iframe = document.createElement("iframe")
  iframe.className = "maincontent"
  iframe.src = url
  document.body.appendChild(iframe)  
}






// Need to add closing pages
let pages = [
  {
    url:"/tuner/inputaudio.html",
    text:"Tune",
    icon:"/tuner/images/microphone.png"
  },
  {
    url:"/tuner/audio.html",
    text:"Listen",
    icon:"/tuner/images/speaker.png"
  },
  {
    url:"",
    text:"Settings",
    icon:"/tuner/images/settings.png"
  }
]
  
  
  
let displaynavbar = function() {
  let navbar = document.createElement("div")
  navbar.className = "navbar"
  
  
  for (let i=0;i<pages.length;i++) {
    let item = pages[i]
    
    let button = document.createElement("button")
    button.className = "navbaritem"
    button.addEventListener("click", function(){
      setpage(pages[i].url)
    })
    
    let img = document.createElement("img")
    img.src = item.icon
    img.className = "navitemicon"
    
    let p = document.createElement("p")
    p.innerHTML = item.text
    p.className = "navitemtext"
    
    button.appendChild(img)
    button.appendChild(p)
    
    navbar.appendChild(button)
  }
  

  document.body.appendChild(navbar)
}

displaynavbar()
