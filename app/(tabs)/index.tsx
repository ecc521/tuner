import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { getScale, getNoteFromFreq, Note } from '../../utils/noteUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TunerScreen() {
  const { tunepitch, transpose } = useSettings();
  const [note, setNote] = useState<Note | null>(null);
  const [listening, setListening] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const settingsRef = useRef({ tunepitch, transpose });
  const scaleRef = useRef(getScale(tunepitch, transpose));

  useEffect(() => {
    settingsRef.current = { tunepitch, transpose };
    scaleRef.current = getScale(tunepitch, transpose);
  }, [tunepitch, transpose]);

  // Initial permission check and cleanup
  useEffect(() => {
    const checkPermissionsAndStart = async () => {
        if (Platform.OS === 'web' && (navigator as any).permissions) {
            try {
                const result = await (navigator as any).permissions.query({ name: 'microphone' });
                if (result.state === 'granted') {
                    await startListening();
                }
            } catch (e) {
                console.log("Permission check skipped or failed", e);
            }
        }
    };

    checkPermissionsAndStart();

    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    if (Platform.OS !== 'web') {
      alert("Tuner currently only supported on Web.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32768;
      analyser.minDecibels = -100;
      analyser.maxDecibels = -10;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch (e) {
            console.log("AudioContext resume failed", e);
        }
      }

      if (ctx.state === 'suspended') {
        // Still suspended, likely need user gesture.
        // Clean up and return false (did not start)
        source.disconnect();
        ctx.close();
        console.log("AudioContext suspended. User gesture required.");
        return;
      }

      setListening(true);
      setPermissionError(false);

      updatePitch();
    } catch (err) {
      setPermissionError(true);
    }
  };

  const stopListening = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (sourceRef.current) sourceRef.current.disconnect();
    // if (analyserRef.current) analyserRef.current.disconnect(); // Not strictly necessary if source disconnected
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }

    setListening(false);
    setNote(null);
  };

  const updatePitch = () => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatFrequencyData(dataArray);

    let maxVolume = -Infinity;
    let maxIndex = -1;

    for (let i = 0; i < bufferLength; i++) {
        if (dataArray[i] > maxVolume) {
            maxVolume = dataArray[i];
            maxIndex = i;
        }
    }

    // Threshold for silence
    if (maxVolume > -60) {
        const freq = maxIndex * (audioContextRef.current.sampleRate / analyserRef.current.fftSize);

        // Use noteUtils
        const scale = scaleRef.current;
        const detectedNote = getNoteFromFreq(freq, scale);

        if (detectedNote) {
             setNote(detectedNote);
        }
    }

    rafRef.current = requestAnimationFrame(updatePitch);
  };

  const toggleListening = () => {
      if (listening) {
          stopListening();
      } else {
          startListening();
      }
  };

  // UI for Cents visualization
  const getNeedleRotation = () => {
      if (!note) return '0deg';
      // -50 to +50 cents -> -45deg to +45deg? Or -90 to 90.
      // Let's go with -45 to 45 for a gauge.
      // cents is usually -50 to 50 (half step).
      const deg = (note.cents / 50) * 45;
      return `${deg}deg`;
  };

  const getNeedleColor = () => {
      if (!note) return 'gray';
      if (Math.abs(note.cents) < 5) return 'green'; // In tune
      if (Math.abs(note.cents) < 20) return 'yellow'; // Close
      return 'red'; // Out of tune
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center p-4">
      <View className="items-center justify-center w-full max-w-md">

        <View className="mb-8 items-center">
            <Text className="text-8xl font-bold text-blue-600 dark:text-blue-400">
                {note ? note.name : "--"}
            </Text>
            <Text className="text-2xl font-semibold text-gray-600 dark:text-gray-300 relative" style={{top: -10}}>
                {note ? note.octave : " "}
            </Text>
        </View>

        {/* Gauge */}
        <View className="w-64 h-32 border-t-2 border-l-2 border-r-2 border-gray-300 rounded-t-full relative overflow-hidden items-center justify-end mb-8">
             {/* Center marker */}
             <View className="absolute bottom-0 w-1 h-8 bg-black z-10" />

             {/* Needle */}
             <View
                className="absolute bottom-0 w-1 h-28 origin-bottom bg-red-500 rounded-full"
                style={{
                    transform: [{ rotate: getNeedleRotation() }],
                    backgroundColor: getNeedleColor(),
                    left: '50%',
                    marginLeft: -2 // Half width
                }}
             />

             <View className="absolute bottom-0 w-4 h-4 bg-gray-800 rounded-full z-20" style={{left: '50%', marginLeft: -8}} />
        </View>

        <Text className="text-xl text-gray-500 dark:text-gray-400 mb-8">
            {note ? `${note.cents > 0 ? '+' : ''}${Math.round(note.cents)} cents` : "Play a note"}
        </Text>

        <Text className="text-sm text-gray-400 mb-2">
            {note ? `${Math.round(note.freq)} Hz` : ""}
        </Text>

        <TouchableOpacity
            onPress={toggleListening}
            className={`px-8 py-4 rounded-full ${listening ? 'bg-red-500' : 'bg-blue-500'} shadow-lg active:opacity-80`}
        >
            <Text className="text-white text-xl font-bold">
                {listening ? "Pause Tuner" : "Start Tuner"}
            </Text>
        </TouchableOpacity>

        {permissionError && (
            <Text className="text-red-500 mt-4 text-center">
                Microphone permission denied or not available.
            </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
