import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { typeScale, spacing } from "../../constants/styles";
import { useAppTheme } from "../../context/ThemeContext";

export default function Tentang() {
  const { colors } = useAppTheme();

  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang, backgroundColor: colors.background }}>
      <Text
        accessibilityLabel="Informasi tentang aplikasi Jelajah Aman"
        style={{ fontSize: typeScale.judul, fontWeight: "bold", color: colors.text }}
      >
        Jelajah Aman
      </Text>

      <Text style={{ fontSize: typeScale.isi, marginTop: spacing.kecil, color: colors.text }}>
        Versi 1.0.0
      </Text>

      <Text style={{ fontSize: typeScale.isi, marginTop: spacing.kecil, color: colors.text }}>
        Pembuat: [Indri Oktavia]
      </Text>
    </SafeAreaView>
  );
}