/**
 * Creates a new AudioContext instance, handling cross-browser compatibility.
 * @returns A new AudioContext instance.
 */
export const createAudioContext = (): AudioContext => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  return new AudioContextClass();
};
