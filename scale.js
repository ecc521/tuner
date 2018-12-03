
//Perhaps something other than localStorage will be used in the future - localStorage only handles strings. IndexedDB handles everything
function getitem(n) {return localStorage.getItem(n)}
function setitem(n,v) {return localStorage.setItem(n,v)}
function deleteitem(n) {return localStorage.removeItem(n)}



//Load user preferences
    
//Frequency for the tuning note, A4
let tunepitch = getitem("tunepitch") || 440   

//Names to call the notes. 
let scale = getitem("notenames") || "C,C#,D,Eb,E,F,F#,G,Ab,A,B,Bb"
scale = scale.split(",")
    
    
    
    
    
    
//Alternate note names
let altnames = {
    "C#":"Db",
    "Db":"C#",
    "D#":"Eb",
    "Eb":"D#",
    "F#":"Gb",
    "Gb":"F#",
    "G#":"Ab",
    "Ab":"G#",
    "A#":"Bb",
    "Bb":"A#"
}




//Create our scale

for (let i=0;i<scale.length;i++) {
    let obj = {}
    obj.name = scale[i]
    obj.altname = altnames[obj.name]
    obj.freq = tunepitch*(2**((i-9)/12)) //Subtract 9 as A comes in position 9 in array
    obj.minfreq = tunepitch*(2**((i-9.5)/12))
    obj.maxfreq = tunepitch*(2**((i-8.5)/12))
    
    
    obj.rawlog = Math.log2(obj.freq)
    obj.log = obj.rawlog%1
    obj.rawminlog = Math.log2(obj.minfreq)
    obj.minlog = obj.rawminlog%1
    obj.rawmaxlog = Math.log2(obj.maxfreq)
    obj.maxlog = obj.rawmaxlog%1
    
    obj.matches = function(freq) {
        //It wrapped
        let log = Math.log2(freq)%1
        
        if (this.minlog > this.maxlog) {
            if (log >= 0.5) {
                return (log>this.minlog)
            }
            else {
                return (log<this.maxlog)
            }
        }
        else {
            return (log >= this.minlog && log <= this.maxlog)
        }
    }
    
    obj.octave = 4
    scale[i] = obj
}
    
    
    
    
    
    
    
    
    
//This function returns a note given the frequency
function notefromfreq(freq) {
    for (let i=0;i<scale.length;i++) {
        if (scale[i].matches(freq)) {
            let note = {}

            note.freq = freq
            note.name = scale[i].name
            note.altname = scale[i].altname
            note.rawlog = Math.log2(freq)
            note.octave = scale[i].octave - Math.round(scale[i].rawlog - note.rawlog)
            
            let range = scale[i].rawmaxlog - scale[i].rawminlog //100 cent range
            let distance = (note.rawlog + (scale[i].octave - note.octave)) - scale[i].rawlog
            note.cents = distance/range*100
            
            return note
            break;
        }
    } 
}
    
    
    
function notefromname(name, octave) {
   
    let note;
    for (let i=0;i<scale.length;i++) {  
        if (scale[i].name === name || scale[i].altname === name) {
            note = Object.assign({}, scale[i]) //Make a copy
            break;
        }
    }
    
    
    
    let diff = octave - note.octave
    
    note.rawlog += diff
    note.rawminlog += diff
    note.rawmaxlog += diff
    
    diff = 2**diff
    
    note.freq *= diff
    note.minfreq *= diff
    note.maxfreq *= diff
    
    
    note.octave = octave
    
    
    return note
}