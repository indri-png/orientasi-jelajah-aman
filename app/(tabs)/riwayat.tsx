// src/app/(tabs)/riwayat.tsx
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Button, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, []),
  );
  

  function konfirmasiHapus(id: number, namaKota: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus ${namaKota}?`);

      if (yakin) {
        void hapus(id);
      }

      return;
    }

    Alert.alert("Konfirmasi Hapus", `Yakin hapus ${namaKota}?`, [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void hapus(id);
        },
      },
    ]);
  }

  async function hapus(id: number) {
    try {
      await hapusFavorit(id);

      const dataTerbaru = await ambilSemuaFavorit();
      setDaftarFavorit(dataTerbaru);
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);

      Alert.alert(
        "Gagal",
        "Kota favorit belum berhasil dihapus. Silakan coba lagi.",
      );
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>

      <Text>Tersimpan {daftarFavorit.length} kota</Text>

      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}

      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>{kota.nama}</Text>

          <Button
            title="Hapus"
            color="red"
            onPress={() => konfirmasiHapus(kota.id, kota.nama)}
          />
        </View>
      ))}
    </SafeAreaView>
  );
}