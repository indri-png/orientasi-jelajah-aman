// src/services/riwayatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ItemRiwayat {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
  waktu: number;
}

const KUNCI_RIWAYAT = "@jelajah_aman:riwayat_pencarian";
export const MAKSIMAL_RIWAYAT = 10;

export async function ambilRiwayatPencarian(): Promise<ItemRiwayat[]> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_RIWAYAT);
    if (!raw) return [];
    const list: ItemRiwayat[] = JSON.parse(raw);
    return Array.isArray(list) ? list.slice(0, MAKSIMAL_RIWAYAT) : [];
  } catch (error) {
    console.error("Gagal mengambil riwayat pencarian:", error);
    return [];
  }
}

export async function tambahRiwayatPencarian(kota: {
  id: number;
  nama: string;
  latitude: number;
  longitude: number;
}): Promise<void> {
  try {
    // Jangan simpan placeholder lokasi saat ini yang tidak spesifik
    if (!kota.nama || kota.nama.trim().length === 0) return;

    const riwayatSaatIni = await ambilRiwayatPencarian();

    // Hapus jika sudah ada nama kota yang sama (case-insensitive) agar yang baru masuk ke urutan paling atas
    const filtered = riwayatSaatIni.filter(
      (item) => item.nama.trim().toLowerCase() !== kota.nama.trim().toLowerCase()
    );

    const itemBaru: ItemRiwayat = {
      id: kota.id,
      nama: kota.nama,
      latitude: kota.latitude,
      longitude: kota.longitude,
      waktu: Date.now(),
    };

    // Masukkan item baru di index 0 dan potong maksimal 10 item
    const listBaru = [itemBaru, ...filtered].slice(0, MAKSIMAL_RIWAYAT);

    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(listBaru));
  } catch (error) {
    console.error("Gagal menambah riwayat pencarian:", error);
  }
}

export async function hapusSatuRiwayat(namaKota: string): Promise<void> {
  try {
    const riwayatSaatIni = await ambilRiwayatPencarian();
    const listBaru = riwayatSaatIni.filter(
      (item) => item.nama.toLowerCase() !== namaKota.toLowerCase()
    );
    await AsyncStorage.setItem(KUNCI_RIWAYAT, JSON.stringify(listBaru));
  } catch (error) {
    console.error("Gagal menghapus riwayat pencarian:", error);
  }
}

export async function hapusSemuaRiwayat(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KUNCI_RIWAYAT);
  } catch (error) {
    console.error("Gagal mengosongkan riwayat pencarian:", error);
  }
}
