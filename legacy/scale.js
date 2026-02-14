//Load user preferences

//Frequency for the tuning note, A4
let tunepitch = localStorage.getItem("tunepitch") || 440

//Names to call the notes.
let scale = localStorage.getItem("notenames") || "C,C♯,D,E♭,E,F,F♯,G,A♭,A,B♭,B"
scale = scale.split(",")

window.notenames = scale

let transpose = Number(localStorage.getItem("transpose")) || 0

//Alternate note names
window.altnames = {
    "C♯":"D♭",
    "D♭":"C♯",
    "D♯":"E♭",
    "E♭":"D♯",
    "F♯":"G♭",
    "G♭":"F♯",
    "G♯":"A♭",
    "A♭":"G♯",
    "A♯":"B♭",
    "B♭":"A♯"
}




//Create our scale

let offset = 9+transpose //Position of A in array.

for (let i=0;i<scale.length;i++) {
    let obj = {}
    obj.name = scale[i]
    obj.altname = altnames[obj.name]

    obj.freq = tunepitch*(2**((i-offset)/12))
    obj.minfreq = tunepitch*(2**((i-offset-0.5)/12))
    obj.maxfreq = tunepitch*(2**((i-offset+0.5)/12))


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
