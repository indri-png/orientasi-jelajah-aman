// src/services/cacheRepository.web.ts
// Implementasi cache berbasis AsyncStorage khusus platform Web untuk menghindari error web worker SQLite
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataCuacaLengkap, DataKualitasUdara } from "../types/weather";
import {
  DataTersimpan,
  KotaUntukCache,
  RingkasanKotaTersimpan,
} from "../types/cache";

interface CacheItemWeb {
  kunci: string;
  kota_id: number;
  nama_kota: string;
  latitude: number;
  longitude: number;
  cuaca: DataCuacaLengkap;
  kualitasUdara: DataKualitasUdara;
  disimpan_pada: number;
}

const STORAGE_KEY_WEB = "@jelajah_aman:cache_cuaca_web";

export function buatKunci(latitude: number, longitude: number): string {
  return latitude.toFixed(2) + "," + longitude.toFixed(2);
}

async function ambilSemuaDataWeb(): Promise<Record<string, CacheItemWeb>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_WEB);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function simpanSemuaDataWeb(data: Record<string, CacheItemWeb>): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY_WEB, JSON.stringify(data));
}

export async function simpanCache(
  kota: KotaUntukCache,
  cuaca: DataCuacaLengkap,
  kualitasUdara: DataKualitasUdara
): Promise<void> {
  const all = await ambilSemuaDataWeb();
  const kunci = buatKunci(kota.latitude, kota.longitude);
  all[kunci] = {
    kunci,
    kota_id: kota.id,
    nama_kota: kota.nama,
    latitude: kota.latitude,
    longitude: kota.longitude,
    cuaca,
    kualitasUdara,
    disimpan_pada: Date.now(),
  };
  await simpanSemuaDataWeb(all);
}

export async function ambilCache(
  latitude: number,
  longitude: number
): Promise<DataTersimpan | null> {
  const all = await ambilSemuaDataWeb();
  const kunci = buatKunci(latitude, longitude);
  const item = all[kunci];
  if (!item) return null;

  return {
    cuaca: item.cuaca,
    kualitasUdara: item.kualitasUdara,
    disimpanPada: item.disimpan_pada,
  };
}

export async function daftarKotaTersimpan(): Promise<RingkasanKotaTersimpan[]> {
  const all = await ambilSemuaDataWeb();
  const list = Object.values(all);
  list.sort((a, b) => b.disimpan_pada - a.disimpan_pada);
  return list.slice(0, 5).map((b) => ({
    kunci: b.kunci,
    id: b.kota_id,
    nama: b.nama_kota,
    latitude: b.latitude,
    longitude: b.longitude,
    disimpanPada: b.disimpan_pada,
  }));
}

export async function bersihkanCacheLama(batasUmurMs: number): Promise<void> {
  const all = await ambilSemuaDataWeb();
  const batas = Date.now() - batasUmurMs;
  let adaPerubahan = false;
  for (const kunci of Object.keys(all)) {
    if (all[kunci].disimpan_pada < batas) {
      delete all[kunci];
      adaPerubahan = true;
    }
  }
  if (adaPerubahan) {
    await simpanSemuaDataWeb(all);
  }
}

export async function hapusSatuCache(kunci: string): Promise<void> {
  const all = await ambilSemuaDataWeb();
  if (all[kunci]) {
    delete all[kunci];
    await simpanSemuaDataWeb(all);
  }
}

export async function hapusSemuaCache(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY_WEB);
}
