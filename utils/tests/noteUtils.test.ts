import { getScale, getNoteFromName, getNoteFromFreq } from "../noteUtils";

describe("getNoteFromName", () => {
  const scale = getScale(440, 0);

  it("should return correct frequency for A4", () => {
    const note = getNoteFromName("A", 4, scale);
    expect(note).toBeDefined();
    expect(note?.freq).toBeCloseTo(440, 2);
    expect(note?.octave).toBe(4);
    expect(note?.name).toBe("A");
  });

  it("should return correct frequency for A5", () => {
    const note = getNoteFromName("A", 5, scale);
    expect(note).toBeDefined();
    expect(note?.freq).toBeCloseTo(880, 2);
    expect(note?.octave).toBe(5);
  });

  it("should return correct frequency for A3", () => {
    const note = getNoteFromName("A", 3, scale);
    expect(note).toBeDefined();
    expect(note?.freq).toBeCloseTo(220, 2);
    expect(note?.octave).toBe(3);
  });

  it("should handle sharp notes using Unicode", () => {
    const note = getNoteFromName("C♯", 4, scale);
    expect(note).toBeDefined();
    expect(note?.name).toBe("C♯");
    // C# is 8 semitones below A4
    expect(note?.freq).toBeCloseTo(440 * (2 ** (-8 / 12)), 2);
  });

  it("should handle flat notes using altname", () => {
    const note = getNoteFromName("D♭", 4, scale);
    expect(note).toBeDefined();
    // D♭ is the altname for C♯
    expect(note?.altname).toBe("D♭");
    expect(note?.freq).toBeCloseTo(440 * (2 ** (-8 / 12)), 2);
  });

  it("should return undefined for invalid note names", () => {
    expect(getNoteFromName("H", 4, scale)).toBeUndefined();
    expect(getNoteFromName("C#", 4, scale)).toBeUndefined(); // Standard # instead of Unicode ♯
  });

  it("should be consistent with getNoteFromFreq", () => {
    const noteNames = ["C", "E", "G", "B"];
    const octaves = [2, 4, 6];
    
    for (const noteName of noteNames) {
      for (const octave of octaves) {
        const note = getNoteFromName(noteName, octave, scale);
        expect(note).toBeDefined();
        if (note) {
          const recoveredNote = getNoteFromFreq(note.freq, scale);
          expect(recoveredNote).toBeDefined();
          expect(recoveredNote?.name).toBe(noteName);
          expect(recoveredNote?.octave).toBe(octave);
          expect(recoveredNote?.cents).toBeCloseTo(0, 5);
        }
      }
    }
  });

  it("should handle different tunepitch", () => {
    const scale442 = getScale(442, 0);
    const note = getNoteFromName("A", 4, scale442);
    expect(note?.freq).toBeCloseTo(442, 2);
  });

  it("should handle extreme octaves", () => {
    const noteA0 = getNoteFromName("A", 0, scale);
    expect(noteA0?.freq).toBeCloseTo(440 / 16, 2);
    
    const noteA8 = getNoteFromName("A", 8, scale);
    expect(noteA8?.freq).toBeCloseTo(440 * 16, 2);
  });
  
  it("should preserve all properties from baseNote and update them correctly", () => {
    const note = getNoteFromName("A", 5, scale);
    expect(note).toBeDefined();
    if (note) {
      const baseNote = scale.find(n => n.name === "A")!;
      expect(note.name).toBe(baseNote.name);
      expect(note.altname).toBe(baseNote.altname);
      expect(note.freq).toBe(baseNote.freq * 2);
      expect(note.minfreq).toBe(baseNote.minfreq * 2);
      expect(note.maxfreq).toBe(baseNote.maxfreq * 2);
      expect(note.rawlog).toBeCloseTo(baseNote.rawlog + 1, 10);
      expect(note.rawminlog).toBeCloseTo(baseNote.rawminlog + 1, 10);
      expect(note.rawmaxlog).toBeCloseTo(baseNote.rawmaxlog + 1, 10);
      expect(note.octave).toBe(5);
      expect(note.cents).toBe(0);
      
      // log, minlog, maxlog should be same as baseNote because they are fractional
      expect(note.log).toBe(baseNote.log);
      expect(note.minlog).toBe(baseNote.minlog);
      expect(note.maxlog).toBe(baseNote.maxlog);
    }
  });
});

describe("getScale", () => {
  // In this tuner implementation, transpose is used to adjust the reference frequencies.
  // A positive transpose (e.g., +12 semitones / one octave up) means the tuner
  // expects the player to be playing higher than the displayed note.
  // Therefore, the reference frequency for a given note name DECREASES.
  // Example: Transpose +12, instrument plays A4 (440Hz), tuner displays A5.
  // The frequency for the scale's 'A' (default A4) becomes 220Hz.

  it("should handle negative transpose and different tunepitch", () => {
    // tunepitch = 415 (A4=415Hz), transpose = -12 (one octave down)
    // offset = 9 + (-12) = -3
    // index for 'A' in scaleNames is 9
    // freq = 415 * (2 ** ((9 - (-3)) / 12)) = 415 * (2 ** (12 / 12)) = 415 * 2 = 830
    const scale = getScale(415, -12);

    const aNote = scale.find(n => n.name === "A");
    expect(aNote).toBeDefined();
    expect(aNote?.freq).toBeCloseTo(830, 2);

    const cNote = scale.find(n => n.name === "C");
    expect(cNote).toBeDefined();
    // freq = 415 * (2 ** (3/12)) = 415 * (2 ** 0.25) ≈ 493.52
    expect(cNote?.freq).toBeCloseTo(415 * Math.pow(2, 0.25), 2);
  });

  it("should handle extreme tunepitch and positive transpose", () => {
    // tunepitch = 440, transpose = 12 (one octave up)
    const scale = getScale(440, 12);

    const aNote = scale.find(n => n.name === "A");
    expect(aNote).toBeDefined();
    // offset = 9 + 12 = 21, i = 9
    // freq = 440 * (2 ** ((9 - 21) / 12)) = 440 * (2 ** -1) = 220
    expect(aNote?.freq).toBeCloseTo(220, 2);

    const cNote = scale.find(n => n.name === "C");
    expect(cNote).toBeDefined();
    // i = 0, freq = 440 * (2 ** ((0 - 21) / 12)) = 440 * (2 ** -1.75) ≈ 130.81
    expect(cNote?.freq).toBeCloseTo(440 * Math.pow(2, -1.75), 2);
  });

  it("should return exactly 12 scale notes", () => {
    const scale = getScale(440, 0);
    expect(scale.length).toBe(12);
  });

  it("should compute accurate minfreq, maxfreq, and logs for A4", () => {
    const scale = getScale(440, 0);
    const aNote = scale.find(n => n.name === "A");
    expect(aNote).toBeDefined();

    if (aNote) {
      expect(aNote.freq).toBe(440);
      expect(aNote.rawlog).toBeCloseTo(Math.log2(440), 10);
      expect(aNote.log).toBeCloseTo(Math.log2(440) % 1, 10);

      // minfreq = 440 * 2^(-0.5/12)
      const expectedMinFreq = 440 * Math.pow(2, -0.5 / 12);
      expect(aNote.minfreq).toBeCloseTo(expectedMinFreq, 5);
      expect(aNote.rawminlog).toBeCloseTo(Math.log2(expectedMinFreq), 10);
      expect(aNote.minlog).toBeCloseTo(Math.log2(expectedMinFreq) % 1, 10);

      // maxfreq = 440 * 2^(0.5/12)
      const expectedMaxFreq = 440 * Math.pow(2, 0.5 / 12);
      expect(aNote.maxfreq).toBeCloseTo(expectedMaxFreq, 5);
      expect(aNote.rawmaxlog).toBeCloseTo(Math.log2(expectedMaxFreq), 10);
      expect(aNote.maxlog).toBeCloseTo(Math.log2(expectedMaxFreq) % 1, 10);
      
      expect(aNote.octave).toBe(4);
    }
  });

  it("should handle standard boundary matching logic (A4)", () => {
    const scale = getScale(440, 0);
    const aNote = scale.find(n => n.name === "A");
    expect(aNote).toBeDefined();

    if (aNote) {
      // Perfect match
      expect(aNote.matches(440)).toBe(true);

      // Just inside boundaries
      expect(aNote.matches(aNote.minfreq * 1.001)).toBe(true);
      expect(aNote.matches(aNote.maxfreq * 0.999)).toBe(true);

      // Just outside boundaries
      expect(aNote.matches(aNote.minfreq * 0.999)).toBe(false);
      expect(aNote.matches(aNote.maxfreq * 1.001)).toBe(false);

      // Far outside boundaries
      expect(aNote.matches(300)).toBe(false);
      expect(aNote.matches(500)).toBe(false);
      
      // Other octaves should also match
      expect(aNote.matches(220)).toBe(true);
      expect(aNote.matches(880)).toBe(true);
    }
  });

  it("should handle wrap-around boundary matching logic (C4)", () => {
    const scale = getScale(440, 0);
    const cNote = scale.find(n => n.name === "C");
    expect(cNote).toBeDefined();
    
    // C4 has a log very close to 0 (or 1), so its minlog is > maxlog, causing a wrap-around
    if (cNote) {
      expect(cNote.minlog).toBeGreaterThan(cNote.maxlog);

      // Perfect match
      expect(cNote.matches(cNote.freq)).toBe(true);

      // Just inside boundaries
      expect(cNote.matches(cNote.minfreq * 1.001)).toBe(true);
      expect(cNote.matches(cNote.maxfreq * 0.999)).toBe(true);

      // Just outside boundaries
      expect(cNote.matches(cNote.minfreq * 0.999)).toBe(false);
      expect(cNote.matches(cNote.maxfreq * 1.001)).toBe(false);
      
      // Other octaves should also match
      expect(cNote.matches(cNote.freq / 2)).toBe(true);
      expect(cNote.matches(cNote.freq * 2)).toBe(true);
      
      // Test the branches in the wrap-around logic explicitly
      // A log just above 0.5 (near minlog)
      const l1 = cNote.minlog + 0.001;
      const f1 = Math.pow(2, Math.floor(cNote.rawminlog) + l1);
      expect(cNote.matches(f1)).toBe(true);
      
      // A log just below 0.5 (near maxlog)
      const l2 = cNote.maxlog - 0.001;
      const f2 = Math.pow(2, Math.floor(cNote.rawmaxlog) + l2);
      expect(cNote.matches(f2)).toBe(true);
    }
  });
  
  it("should test all altnames", () => {
    const scale = getScale(440, 0);
    
    const dFlat = scale.find(n => n.altname === "D♭");
    expect(dFlat?.name).toBe("C♯");
    
    const eFlat = scale.find(n => n.name === "E♭");
    expect(eFlat?.altname).toBe("D♯");
    
    const gFlat = scale.find(n => n.altname === "G♭");
    expect(gFlat?.name).toBe("F♯");
    
    const aFlat = scale.find(n => n.name === "A♭");
    expect(aFlat?.altname).toBe("G♯");
    
    const bFlat = scale.find(n => n.name === "B♭");
    expect(bFlat?.altname).toBe("A♯");
    
    // Non-accidental notes should have altname same as name
    const aNote = scale.find(n => n.name === "A");
    expect(aNote?.altname).toBe("A");
  });
});
