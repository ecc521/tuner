import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, StyleSheet } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { getScale, getNoteFromName, Note, ScaleNote } from '../../utils/noteUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ToneGeneratorScreen() {
  const { tunepitch, transpose } = useSettings();
  const scale = useMemo(() => getScale(tunepitch, transpose), [tunepitch, transpose]);

  const [frequency, setFrequency] = useState<number>(440);
  const [selectedNoteName, setSelectedNoteName] = useState<string>("A");
  const [selectedOctave, setSelectedOctave] = useState<number>(4);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      stopTone();
    };
  }, []);

  // Update frequency when settings change or note selection changes
  useEffect(() => {
      // If user selected a note, update frequency
      const note = getNoteFromName(selectedNoteName, selectedOctave, scale);
      if (note) {
          setFrequency(note.freq);
      }
  }, [selectedNoteName, selectedOctave, tunepitch, transpose]);

  // Update oscillator when frequency changes
  useEffect(() => {
      if (oscillatorRef.current && audioContextRef.current) {
          oscillatorRef.current.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      }
  }, [frequency]);

  const startTone = () => {
    if (Platform.OS !== 'web') {
        alert("Tone Generator currently only supported on Web.");
        return;
    }

    try {
        const ctx = new AudioContext();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsPlaying(true);
    } catch (e) {
        console.error(e);
    }
  };

  const stopTone = () => {
    if (gainNodeRef.current && audioContextRef.current) {
        const ctx = audioContextRef.current;
        gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

        setTimeout(() => {
            if (oscillatorRef.current) {
                try { oscillatorRef.current.stop(); } catch(e){}
                oscillatorRef.current.disconnect();
            }
            if (gainNodeRef.current) gainNodeRef.current.disconnect();
            if (audioContextRef.current) audioContextRef.current.close();

            oscillatorRef.current = null;
            gainNodeRef.current = null;
            audioContextRef.current = null;
        }, 150);
    } else {
        setIsPlaying(false);
    }
    setIsPlaying(false);
  };

  const toggleTone = () => {
      if (isPlaying) stopTone();
      else startTone();
  };

  const handleFreqChange = (text: string) => {
      const val = parseFloat(text);
      if (!isNaN(val)) {
          setFrequency(val);
          // Deselect note if manual entry?
          // For now, keep it simple.
      }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>

        <View className="mb-8 items-center w-full">
            <Text className="text-gray-500 mb-2">Frequency (Hz)</Text>
            <TextInput
                className="text-4xl font-bold text-blue-600 dark:text-blue-400 text-center border-b border-gray-300 w-full"
                value={String(Math.round(frequency * 10) / 10)}
                onChangeText={handleFreqChange}
                keyboardType="numeric"
            />
        </View>

        {/* Note Selector */}
        <View className="mb-8 w-full">
            <Text className="text-gray-500 mb-2 text-center">Select Note</Text>
            <View className="flex-row flex-wrap justify-center gap-2 mb-4">
                {scale.map((n) => (
                    <TouchableOpacity
                        key={n.name}
                        onPress={() => setSelectedNoteName(n.name)}
                        className={`w-12 h-12 rounded-full items-center justify-center ${selectedNoteName === n.name ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-800'}`}
                    >
                        <Text className={`${selectedNoteName === n.name ? 'text-white' : 'text-gray-800 dark:text-gray-200'} font-bold`}>
                            {n.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-gray-500 mb-2 text-center">Select Octave</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 max-h-14" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: 8 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((oct) => (
                    <TouchableOpacity
                        key={oct}
                        onPress={() => setSelectedOctave(oct)}
                        className={`w-10 h-10 rounded-full items-center justify-center ${selectedOctave === oct ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-800'}`}
                    >
                        <Text className={`${selectedOctave === oct ? 'text-white' : 'text-gray-800 dark:text-gray-200'} font-bold`}>
                            {oct}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        <TouchableOpacity
            onPress={toggleTone}
            className={`px-12 py-6 rounded-full ${isPlaying ? 'bg-red-500' : 'bg-blue-500'} shadow-lg active:opacity-80 mt-8`}
        >
            <Text className="text-white text-2xl font-bold">
                {isPlaying ? "Stop" : "Play"}
            </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
