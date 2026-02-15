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
