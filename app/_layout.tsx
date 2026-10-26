// app/_layout.tsx (root layout) 
import { Stack } from "expo-router"; 
import { ThemeProvider, useAppTheme } from "../context/ThemeContext";

function RootStack() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    > 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
      <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} /> 
      <Stack.Screen 
        name="tambah-favorit" 
        options={{ presentation: "modal", title: "Tambah Favorit" }} 
      /> 
    </Stack> 
  );
}

export default function RootLayout() { 
  return ( 
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  ); 
}