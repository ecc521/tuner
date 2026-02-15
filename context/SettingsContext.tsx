import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
  tunepitch: number;
  setTunepitch: (value: number) => void;
  transpose: number;
  setTranspose: (value: number) => void;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType>({
  tunepitch: 440,
  setTunepitch: () => {},
  transpose: 0,
  setTranspose: () => {},
  loading: true,
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [tunepitch, setTunepitchState] = useState(440);
  const [transpose, setTransposeState] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedTunepitch = await AsyncStorage.getItem('tunepitch');
        if (storedTunepitch) setTunepitchState(Number(storedTunepitch));

        const storedTranspose = await AsyncStorage.getItem('transpose');
        if (storedTranspose) setTransposeState(Number(storedTranspose));
      } catch (e) {
        console.error("Failed to load settings", e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const setTunepitch = async (value: number) => {
    if (value === tunepitch) return;
    setTunepitchState(value);
    await AsyncStorage.setItem('tunepitch', String(value));
  };

  const setTranspose = async (value: number) => {
    if (value === transpose) return;
    setTransposeState(value);
    await AsyncStorage.setItem('transpose', String(value));
  };

  return (
    <SettingsContext.Provider value={{ tunepitch, setTunepitch, transpose, setTranspose, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
