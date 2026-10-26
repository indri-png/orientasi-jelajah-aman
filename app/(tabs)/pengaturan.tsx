// src/app/(tabs)/pengaturan.tsx 
import { useState } from "react"; 
import { Text, Button, View } from "react-native"; 
import { SafeAreaView } from "react-native-safe-area-context"; 
import { hapusSemuaCache } from "../../services/cacheRepository"; 
import { useAppTheme } from "../../context/ThemeContext";
  
export default function TabPengaturan() { 
  const [pesan, setPesan] = useState<string | null>(null); 
  const { mode, setMode, colors, isDark } = useAppTheme();
  
  async function hapusDataTersimpan() { 
    await hapusSemuaCache(); 
    setPesan("Data cuaca tersimpan sudah dihapus."); 
  } 
  
  return ( 
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.background }}> 
      <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>Jelajah Aman</Text> 
      <Text style={{ color: colors.text }}>Versi 1.0.0</Text> 

      <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 8, color: colors.text }}>
        Mode Tampilan
      </Text>
      <Text style={{ color: colors.text, fontSize: 14 }}>
        Mode saat ini: {mode === "light" ? "Terang" : mode === "dark" ? "Gelap" : "Ikuti Sistem"}
      </Text>
      <View style={{ flexDirection: "row", gap: 8, marginVertical: 4 }}>
        <Button
          title="Terang"
          color={mode === "light" ? colors.tint : "#888888"}
          onPress={() => setMode("light")}
        />
        <Button
          title="Gelap"
          color={mode === "dark" ? colors.tint : "#888888"}
          onPress={() => setMode("dark")}
        />
        <Button
          title="Ikuti Sistem"
          color={mode === "system" ? colors.tint : "#888888"}
          onPress={() => setMode("system")}
        />
      </View>

      <Button title="Hapus Data Cuaca Tersimpan" onPress={hapusDataTersimpan} /> 
      {pesan && <Text accessibilityLabel={pesan} style={{ color: colors.text }}>{pesan}</Text>} 
    </SafeAreaView> 
  ); 
}