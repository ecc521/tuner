if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/tuner/sw.js');
}

window.AudioContext = window.AudioContext || window.webkitAudioContext







let displaynavbar = function() {
  let navbar = document.createElement("div")
  navbar.className = "navbar"
  
  let img = document.createElement("img")
  img.src = "/tuner/images/settings.png"
  img.className = "navbaricon"
  navbar.appendChild(img)
  document.body.appendChild(navbar)
}

displaynavbar()
