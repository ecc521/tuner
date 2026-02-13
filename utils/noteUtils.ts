export interface Note {
  name: string;
  altname: string;
  freq: number;
  minfreq: number;
  maxfreq: number;
  rawlog: number;
  log: number;
  rawminlog: number;
  minlog: number;
  rawmaxlog: number;
  maxlog: number;
  octave: number;
  cents: number;
}

export interface ScaleNote {
  name: string;
  altname: string;
  freq: number;
  minfreq: number;
  maxfreq: number;
  rawlog: number;
  log: number;
  rawminlog: number;
  minlog: number;
  rawmaxlog: number;
  maxlog: number;
  octave: number;
  matches: (freq: number) => boolean;
}

export const getScale = (tunepitch: number, transpose: number): ScaleNote[] => {
  const scaleNames = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];

  const altnames: {[key: string]: string} = {
    "C♯":"D♭", "D♭":"C♯", "D♯":"E♭", "E♭":"D♯", "F♯":"G♭", "G♭":"F♯", "G♯":"A♭", "A♭":"G♯", "A♯":"B♭", "B♭":"A♯"
  };

  const offset = 9 + transpose; // Position of A (index 9) relative to A4 (tunepitch)

  const scale: ScaleNote[] = [];

  for (let i = 0; i < scaleNames.length; i++) {
    const name = scaleNames[i];
    const altname = altnames[name] || name;

    const freq = tunepitch * (2 ** ((i - offset) / 12));
    const minfreq = tunepitch * (2 ** ((i - offset - 0.5) / 12));
    const maxfreq = tunepitch * (2 ** ((i - offset + 0.5) / 12));

    const rawlog = Math.log2(freq);
    const rawminlog = Math.log2(minfreq);
    const rawmaxlog = Math.log2(maxfreq);

    const log = rawlog % 1;
    const minlog = rawminlog % 1;
    const maxlog = rawmaxlog % 1;

    const matches = function(f: number) {
        const l = Math.log2(f) % 1;
        // Handle negative logs if needed, though frequencies should be audible > 20Hz -> log > 4.
        // But just in case:
        // if (l < 0) l += 1;

        if (minlog > maxlog) {
            // Wrapped around 0/1 boundary
            if (l >= 0.5) {
                return (l > minlog);
            } else {
                return (l < maxlog);
            }
        } else {
            return (l >= minlog && l <= maxlog);
        }
    };

    scale.push({
      name,
      altname,
      freq,
      minfreq,
      maxfreq,
      rawlog,
      log,
      rawminlog,
      minlog,
      rawmaxlog,
      maxlog,
      octave: 4,
      matches
    });
  }
  return scale;
};

export const getNoteFromFreq = (freq: number, scale: ScaleNote[]): Note | undefined => {
  for (let i = 0; i < scale.length; i++) {
    if (scale[i].matches(freq)) {
      const baseNote = scale[i];

      const rawlog = Math.log2(freq);
      const octave = baseNote.octave - Math.round(baseNote.rawlog - rawlog);

      const range = baseNote.rawmaxlog - baseNote.rawminlog; // ~ 1/12
      // distance = (actual_log + (base_octave - calculated_octave)) - base_log
      // Actually, let's trace the logic carefully.
      // note.log is fraction part. baseNote.log is fraction part.
      // We want deviation in cents.

      // Let's use the exact logic from legacy:
      // let distance = (note.rawlog + (scale[i].octave - note.octave)) - scale[i].rawlog
      const distance = (rawlog + (baseNote.octave - octave)) - baseNote.rawlog;
      const cents = (distance / range) * 100;

      return {
        ...baseNote,
        freq, // The actual frequency detected
        rawlog,
        octave,
        cents
      } as Note;
    }
  }
  return undefined;
};

export const getNoteFromName = (name: string, octave: number, scale: ScaleNote[]): Note | undefined => {
    let baseNote: ScaleNote | undefined;
    for (let i=0;i<scale.length;i++) {
        if (scale[i].name === name || scale[i].altname === name) {
            baseNote = scale[i];
            break;
        }
    }

    if (!baseNote) return undefined;

    const diff = octave - baseNote.octave;
    const factor = 2**diff;

    return {
        ...baseNote,
        freq: baseNote.freq * factor,
        minfreq: baseNote.minfreq * factor,
        maxfreq: baseNote.maxfreq * factor,
        rawlog: baseNote.rawlog + diff,
        rawminlog: baseNote.rawminlog + diff,
        rawmaxlog: baseNote.rawmaxlog + diff,
        octave: octave,
        cents: 0
    } as Note;
}
