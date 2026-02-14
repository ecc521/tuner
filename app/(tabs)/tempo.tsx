import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TempoFinderScreen() {
  const [bpm, setBpm] = useState<number | null>(null);
  const [tapHistory, setTapHistory] = useState<number[]>([]);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
      return () => {
          if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      };
  }, []);

  const handleTap = () => {
      const now = Date.now();
      let newHistory = [...tapHistory];

      // Auto-reset if pause is too long (e.g. 2s)
      if (newHistory.length > 0 && now - newHistory[newHistory.length - 1] > 2000) {
          newHistory = [now];
          setBpm(null);
      } else {
          newHistory.push(now);
      }

      // Limit history to last 8 taps for responsiveness (moving average)
      if (newHistory.length > 8) {
          newHistory = newHistory.slice(newHistory.length - 8);
      }

      setTapHistory(newHistory);

      if (newHistory.length > 1) {
          const duration = newHistory[newHistory.length - 1] - newHistory[0];
          const beatCount = newHistory.length - 1;
          const calculatedBpm = Math.round((beatCount / duration) * 60000);
          setBpm(calculatedBpm);
      } else {
          // If first tap or reset, BPM is null/reset
          // But we keep BPM null until 2nd tap.
      }

      // Reset timer
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => {
          setTapHistory([]);
          setBpm(null);
      }, 3000); // 3s inactivity reset
  };

  const handleReset = () => {
      setTapHistory([]);
      setBpm(null);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center p-4">
      <View className="items-center justify-center w-full max-w-md">
        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">
            Tempo Finder
        </Text>

        <TouchableOpacity
            className="w-64 h-64 bg-blue-500 rounded-full items-center justify-center shadow-2xl active:bg-blue-600 active:opacity-90"
            onPress={handleTap}
            activeOpacity={0.8}
            style={{ elevation: 5 }} // Android shadow
        >
            <Text className="text-white text-5xl font-bold text-center">
                {bpm ? bpm : "TAP"}
            </Text>
            <Text className="text-white/80 text-lg mt-2 font-medium">
                {bpm ? "BPM" : "Start Tapping"}
            </Text>
        </TouchableOpacity>

        <Text className="text-gray-500 mt-8 text-center h-6">
            {tapHistory.length > 0 ? "Keep tapping for accuracy..." : " "}
        </Text>

        <TouchableOpacity
            className="mt-8 px-8 py-3 bg-gray-200 dark:bg-gray-800 rounded-full"
            onPress={handleReset}
        >
            <Text className="text-gray-600 dark:text-gray-300 font-semibold text-lg">
                Reset
            </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
