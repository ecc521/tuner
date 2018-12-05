if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/tuner/sw.js');
}

window.AudioContext = window.AudioContext || window.webkitAudioContext




function opentuner() {
  alert("Tuner under development")
}

function opengenerator() {
  alert("Note Generator under development")
}

let displaynavbar = function() {
  let navbar = document.createElement("div")
  navbar.className = "navbar"
  
  let pages = [
    {
      draw:opentuner,
      text:"Tuner",
      icon:"/tuner/images/settings.png"
    },
    {
      draw:opengenerator,
      text:"Generator",
      icon:"/tuner/images/speaker.png"
    }           
  ]
  
  
  for (let i=0;i<pages.length;i++) {
    let item = pages[i]
    
    let button = document.createElement("btn")
    button.addEventListener("click", item.draw)
    
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
