if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/tuner/sw.js');
}

window.AudioContext = window.AudioContext || window.webkitAudioContext







let navbar = function() {
  let img = document.createElement("img")
  img.src = "/tuner/images/settings.png"
  document.body.appendChild(img)
}
