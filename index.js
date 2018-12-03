if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/tuner/sw.js');
}

window.AudioContext = window.AudioContext || window.webkitAudioContext
