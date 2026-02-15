import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MetronomeScreen() {
  const [bpm, setBpm] = useState(120);
  const [bpmInput, setBpmInput] = useState(bpm.toString());
  const [isPlaying, setIsPlaying] = useState(false);
  const [beat, setBeat] = useState(0); // 0-3 for 4/4 time

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const timerIDRef = useRef<number | null>(null);
  const bpmRef = useRef(bpm);
  const beatRef = useRef(0); // To track beat number in audio thread

  useEffect(() => {
    bpmRef.current = bpm;
    setBpmInput(bpm.toString());
  }, [bpm]);

  useEffect(() => {
    return () => stopMetronome();
  }, []);

  const nextNote = () => {
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      beatRef.current = (beatRef.current + 1) % 4;
  };

  const scheduleNote = (beatNumber: number, time: number) => {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const envelope = ctx.createGain();

      osc.frequency.value = (beatNumber === 0) ? 1000 : 800;
      envelope.gain.value = 1;
      envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(envelope);
      envelope.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.1);

      // Schedule visual update
      const timeUntilNote = (time - ctx.currentTime) * 1000;
      setTimeout(() => {
          setBeat(beatNumber);
      }, Math.max(0, timeUntilNote));
  };

  const scheduler = () => {
      if (!audioContextRef.current) return;
      // Schedule ahead 100ms
      while (nextNoteTimeRef.current < audioContextRef.current.currentTime + 0.1) {
          scheduleNote(beatRef.current, nextNoteTimeRef.current);
          nextNote();
      }
      timerIDRef.current = window.setTimeout(scheduler, 25);
  };

  const startMetronome = () => {
      if (Platform.OS !== 'web') {
          alert("Metronome currently only supported on Web.");
          return;
      }

      if (timerIDRef.current || isPlaying) return;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      beatRef.current = 0;

      setIsPlaying(true);
      scheduler();
  };

  const stopMetronome = () => {
      if (timerIDRef.current) {
          clearTimeout(timerIDRef.current);
          timerIDRef.current = null;
      }
      if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
      }
      setIsPlaying(false);
      setBeat(0);
  };

  const toggleMetronome = () => {
      if (isPlaying) stopMetronome();
      else startMetronome();
  };

  const adjustBpm = (amount: number) => {
      setBpm(prev => Math.max(1, Math.min(999, prev + amount)));
  };

  const handleInputChange = (text: string) => {
      setBpmInput(text);
  };

  const handleInputSubmit = () => {
      let value = parseInt(bpmInput, 10);

      if (isNaN(value)) {
          setBpmInput(bpm.toString());
          return;
      }

      value = Math.max(1, Math.min(999, value));
      setBpm(value);
      setBpmInput(value.toString());
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
      <View className="items-center w-full max-w-sm">

        {/* Visual Indicator */}
        <View className="flex-row justify-center gap-4 mb-12">
            {[0, 1, 2, 3].map((b) => (
                <View
                    key={b}
                    className={`w-12 h-12 rounded-full ${
                        beat === b && isPlaying
                        ? (b === 0 ? 'bg-red-500' : 'bg-blue-500')
                        : 'bg-gray-200 dark:bg-gray-800'
                    }`}
                />
            ))}
        </View>

        {/* BPM Display */}
        <TextInput
            className="text-8xl font-bold text-gray-800 dark:text-gray-100 mb-4 text-center w-full"
            value={bpmInput}
            onChangeText={handleInputChange}
            onBlur={handleInputSubmit}
            onSubmitEditing={handleInputSubmit}
            keyboardType="numeric"
            returnKeyType="done"
            maxLength={3}
        />
        <Text className="text-xl text-gray-500 mb-8">BPM</Text>

        {/* Controls */}
        <View className="flex-row gap-4 mb-8">
            <TouchableOpacity onPress={() => adjustBpm(-5)} className="bg-gray-200 p-4 rounded-full"><Text className="text-xl font-bold">-5</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => adjustBpm(-1)} className="bg-gray-200 p-4 rounded-full"><Text className="text-xl font-bold">-1</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => adjustBpm(1)} className="bg-gray-200 p-4 rounded-full"><Text className="text-xl font-bold">+1</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => adjustBpm(5)} className="bg-gray-200 p-4 rounded-full"><Text className="text-xl font-bold">+5</Text></TouchableOpacity>
        </View>

        <TouchableOpacity
            onPress={toggleMetronome}
            className={`w-32 h-32 rounded-full items-center justify-center ${isPlaying ? 'bg-red-500' : 'bg-blue-500'} shadow-xl`}
        >
            <Text className="text-white text-3xl font-bold">
                {isPlaying ? "STOP" : "START"}
            </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
