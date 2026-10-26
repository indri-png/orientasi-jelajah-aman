// src/app/(tabs)/riwayat.tsx
import { useFocusEffect, router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import {
  ambilRiwayatPencarian,
  ItemRiwayat,
} from "../../services/riwayatStorage";
import {
  daftarKotaTersimpan,
  hapusSatuCache,
} from "../../services/cacheRepository";
import { RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";
import { useAppTheme } from "../../context/ThemeContext";

export default function TabRiwayat() {
  const { colors } = useAppTheme();
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [daftarRiwayat, setDaftarRiwayat] = useState<ItemRiwayat[]>([]);
  const [daftarCache, setDaftarCache] = useState<RingkasanKotaTersimpan[]>([]);

  const muatData = useCallback(() => {
    ambilSemuaFavorit().then(setDaftarFavorit);
    ambilRiwayatPencarian().then(setDaftarRiwayat);
    daftarKotaTersimpan().then(setDaftarCache);
  }, []);

  useFocusEffect(
    useCallback(() => {
      muatData();
    }, [muatData])
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
      setDaftarFavorit(await ambilSemuaFavorit());
    } catch (error) {
      console.error("Gagal menghapus favorit:", error);

      Alert.alert(
        "Gagal",
        "Kota favorit belum berhasil dihapus. Silakan coba lagi."
      );
    }
  }

  // Fitur 3: Hapus cache kota dengan konfirmasi Alert
  function konfirmasiHapusCache(kunci: string, namaKota: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus cache ${namaKota}?`);
      if (yakin) {
        void hapusCache(kunci);
      }
      return;
    }

    Alert.alert("Konfirmasi Hapus Cache", `Yakin hapus cache ${namaKota}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => {
          void hapusCache(kunci);
        },
      },
    ]);
  }

  async function hapusCache(kunci: string) {
    try {
      await hapusSatuCache(kunci);
      setDaftarCache(await daftarKotaTersimpan());
    } catch (error) {
      console.error("Gagal menghapus cache:", error);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* FITUR 2: RIWAYAT PENCARIAN TERAKHIR (MAKS 10) */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
            Riwayat Pencarian
          </Text>
          <Text style={{ color: "#888888", fontSize: 12 }}>
            Maksimal 10 pencarian terakhir. Tekan untuk mencari kembali.
          </Text>
          {daftarRiwayat.length === 0 && (
            <Text style={{ color: colors.text }}>Belum ada riwayat pencarian</Text>
          )}
          {daftarRiwayat.map((item) => (
            <TouchableOpacity
              key={item.nama + item.id}
              onPress={() =>
                router.push({
                  pathname: "/",
                  params: {
                    cariNama: item.nama,
                    lat: String(item.latitude),
                    lon: String(item.longitude),
                    id: String(item.id),
                  },
                })
              }
              style={{ paddingVertical: 4 }}
            >
              <Text style={{ color: colors.tint, fontSize: 15 }}>
                {item.nama}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FITUR 3: PENGHAPUSAN CACHE KOTA */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
            Cache Kota Tersimpan
          </Text>
          {daftarCache.length === 0 && (
            <Text style={{ color: colors.text }}>Tidak ada cache tersimpan</Text>
          )}
          {daftarCache.map((item) => (
            <View
              key={item.kunci}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>{item.nama}</Text>
              <Button
                title="Hapus Cache"
                color="red"
                onPress={() => konfirmasiHapusCache(item.kunci, item.nama)}
              />
            </View>
          ))}
        </View>

        {/* KOTA FAVORIT (ASLI PRAKTIKUM) */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
            Kota Favorit
          </Text>
          <Text style={{ color: colors.text }}>
            Tersimpan {daftarFavorit.length} kota
          </Text>

          {daftarFavorit.length === 0 && (
            <Text style={{ color: colors.text }}>Belum ada kota favorit</Text>
          )}

          {daftarFavorit.map((kota) => (
            <View
              key={kota.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.text }}>{kota.nama}</Text>

              <Button
                title="Hapus"
                color="red"
                onPress={() => konfirmasiHapus(kota.id, kota.nama)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}