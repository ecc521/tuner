import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '../../context/SettingsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { tunepitch, setTunepitch, transpose, setTranspose, loading } = useSettings();
  const [localTunepitch, setLocalTunepitch] = useState(String(tunepitch));
  const { setColorScheme } = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    (async () => {
       try {
         const saved = await AsyncStorage.getItem('theme');
         if (saved) {
             setThemePreference(saved as any);
         }
       } catch { }
    })();
  }, []);

  useEffect(() => {
      setLocalTunepitch(String(tunepitch));
  }, [tunepitch]);

  // Keep a ref to the latest local value for the unmount cleanup
  const localTunepitchRef = useRef(localTunepitch);
  useEffect(() => {
      localTunepitchRef.current = localTunepitch;
  }, [localTunepitch]);

  // Update context when the component unmounts (e.g. navigating away)
  useEffect(() => {
      return () => {
          const val = parseFloat(localTunepitchRef.current);
          if (!isNaN(val) && val > 0) {
              setTunepitch(val);
          }
      };
  }, [setTunepitch]);

  const handleTunepitchChange = (text: string) => {
      setLocalTunepitch(text);
  };

  const handleBlur = () => {
      const val = parseFloat(localTunepitch);
      if (!isNaN(val) && val > 0 && val !== tunepitch) {
          setTunepitch(val);
      }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
      setThemePreference(newTheme);
      setColorScheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
  };

  if (loading) {
      return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 items-center justify-center">
            <Text className="text-gray-800 dark:text-gray-100">Loading settings...</Text>
        </SafeAreaView>
      );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 p-4">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="max-w-md w-full mx-auto">
            <Text className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 mt-4">Settings</Text>

            <View className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Appearance
                </Text>
                <View className="flex-row bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    {['system', 'light', 'dark'].map((theme) => (
                        <TouchableOpacity
                            key={theme}
                            onPress={() => handleThemeChange(theme as 'light' | 'dark' | 'system')}
                            className={`flex-1 py-2 rounded-md items-center justify-center ${
                                themePreference === theme
                                ? 'bg-white dark:bg-gray-600 shadow-sm'
                                : ''
                            }`}
                        >
                            <Text className={`capitalize font-medium ${
                                themePreference === theme
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {theme}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Concert Pitch (A4)
                </Text>
                <View className="flex-row items-center border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700">
                    <TextInput
                        className="flex-1 text-xl text-gray-800 dark:text-gray-100"
                        value={localTunepitch}
                        onChangeText={handleTunepitchChange}
                        onBlur={handleBlur}
                        keyboardType="numeric"
                        placeholder="440"
                        placeholderTextColor="#9ca3af"
                    />
                    <Text className="text-gray-500 dark:text-gray-400 ml-2 font-medium">Hz</Text>
                </View>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Standard tuning is 440 Hz.
                </Text>
            </View>

            <View className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">
                <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
                    Transposition
                </Text>

                <View className="flex-row items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-2 border border-gray-300 dark:border-gray-600">
                    <TouchableOpacity
                        onPress={() => setTranspose(transpose - 1)}
                        className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg items-center justify-center active:opacity-70"
                    >
                        <Text className="text-2xl font-bold text-gray-700 dark:text-gray-200">-</Text>
                    </TouchableOpacity>

                    <Text className="text-3xl font-bold text-blue-600 dark:text-blue-400 min-w-[60px] text-center">
                        {transpose > 0 ? `+${transpose}` : transpose}
                    </Text>

                    <TouchableOpacity
                        onPress={() => setTranspose(transpose + 1)}
                        className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg items-center justify-center active:opacity-70"
                    >
                        <Text className="text-2xl font-bold text-gray-700 dark:text-gray-200">+</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Adjust in half-steps (semitones)
                </Text>
            </View>

            <View className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8 items-center">
                <Text className="text-gray-400 text-sm mb-2">
                    Tuner App v1.0.0
                </Text>
                <Link href="/licenses" asChild>
                    <TouchableOpacity>
                        <Text className="text-blue-500 dark:text-blue-400 text-sm underline">
                            Third-Party Licenses
                        </Text>
                    </TouchableOpacity>
                </Link>
            </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
