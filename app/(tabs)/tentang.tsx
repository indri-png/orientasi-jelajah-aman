import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "react-native";
import { typeScale, spacing } from "../../constants/styles";

export default function Tentang() {
  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang }}>
      <Text
        accessibilityLabel="Informasi tentang aplikasi Jelajah Aman"
        style={{ fontSize: typeScale.judul, fontWeight: "bold" }}
      >
        Jelajah Aman
      </Text>

      <Text style={{ fontSize: typeScale.isi, marginTop: spacing.kecil }}>
        Versi 1.0.0
      </Text>

      <Text style={{ fontSize: typeScale.isi, marginTop: spacing.kecil }}>
        Pembuat: [Indri Oktavia]
      </Text>
    </SafeAreaView>
  );
}