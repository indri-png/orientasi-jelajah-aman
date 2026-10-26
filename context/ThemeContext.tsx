// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/theme";

export type ModeTema = "light" | "dark" | "system";

export interface ThemeColors {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
  card: string;
  border: string;
}

interface ThemeContextValue {
  mode: ModeTema;
  setMode: (mode: ModeTema) => void;
  isDark: boolean;
  colors: ThemeColors;
}

const KUNCI_TEMA = "@jelajah_aman:mode_tampilan";

const temaTerang: ThemeColors = {
  text: Colors.light.text,
  background: Colors.light.background,
  tint: Colors.light.tint,
  icon: Colors.light.icon,
  tabIconDefault: Colors.light.tabIconDefault,
  tabIconSelected: Colors.light.tabIconSelected,
  card: "#F4F7FA",
  border: "#E1E6EB",
};

const temaGelap: ThemeColors = {
  text: Colors.dark.text,
  background: Colors.dark.background,
  tint: Colors.dark.tint,
  icon: Colors.dark.icon,
  tabIconDefault: Colors.dark.tabIconDefault,
  tabIconSelected: Colors.dark.tabIconSelected,
  card: "#1F2328",
  border: "#30363D",
};

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  setMode: () => {},
  isDark: false,
  colors: temaTerang,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const skemaPerangkat = useDeviceColorScheme();
  const [mode, setModeState] = useState<ModeTema>("system");
  const [sudahDimuat, setSudahDimuat] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KUNCI_TEMA)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      })
      .catch(() => {})
      .finally(() => {
        setSudahDimuat(true);
      });
  }, []);

  function setMode(modeBaru: ModeTema) {
    setModeState(modeBaru);
    AsyncStorage.setItem(KUNCI_TEMA, modeBaru).catch(() => {});
  }

  const isDark =
    mode === "dark"
      ? true
      : mode === "light"
      ? false
      : skemaPerangkat === "dark";

  const colors = isDark ? temaGelap : temaTerang;

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
