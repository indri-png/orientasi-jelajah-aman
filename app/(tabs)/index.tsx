// src/app/(tabs)/index.tsx 
import { useState, useEffect, useRef } from "react"; 
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  Button, 
  TouchableOpacity, 
  Alert,
  Platform,
} from "react-native"; 
import { SafeAreaView } from "react-native-safe-area-context"; 
import { router, useLocalSearchParams } from "expo-router"; 
  
import SearchBox from "../../components/SearchBox"; 
import WeatherCard from "../../components/WeatherCard"; 
import AtribusiCuaca from "../../components/AtribusiCuaca"; 
import StatusData from "../../components/StatusData"; 
import { useDebounce } from "../../hooks/use-debounce"; 
import { cariKota } from "../../services/geocodingService"; 
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository"; 
import { bersihkanCacheLama, daftarKotaTersimpan, hapusSatuCache } from "../../services/cacheRepository"; 
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService"; 
import { konversiTingkatAQI } from "../../services/weatherAdapter"; 
import { labelKodeCuaca } from "../../constants/weatherCodes"; 
import { HasilGeocoding } from "../../types/geocoding"; 
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache"; 
import { tambahRiwayatPencarian } from "../../services/riwayatStorage";
import { useAppTheme } from "../../context/ThemeContext";
  
export default function HalamanUtama() { 
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ cariNama?: string; lat?: string; lon?: string; id?: string }>();

  const [teksCari, setTeksCari] = useState(""); 
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]); 
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null); 
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null); 
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]); 
  const [sedangMemuat, setSedangMemuat] = useState(false); 
  const [pesanError, setPesanError] = useState<string | null>(null); 
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null); 
  
  const teksTertunda = useDebounce(teksCari, 500); 
  const requestIdRef = useRef(0); // pencegah race condition 

  async function muatKotaTersimpan() { 
    setKotaTersimpan(await daftarKotaTersimpan()); 
  } 
  
  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan 
  useEffect(() => { 
    bersihkanCacheLama(BATAS_CACHE_MS) 
      .then(muatKotaTersimpan) 
      .catch(() => {}); 
  }, []); 

  // Fitur 2: Saat riwayat ditekan dari Tab Riwayat
  useEffect(() => {
    if (params.cariNama) {
      setTeksCari(params.cariNama);
      if (params.lat && params.lon) {
        pilihKota({
          id: params.id ? Number(params.id) : 0,
          name: params.cariNama,
          latitude: Number(params.lat),
          longitude: Number(params.lon),
          country: "",
        });
      }
    }
  }, [params.cariNama, params.lat, params.lon, params.id]);
  
  useEffect(() => { 
    if (teksTertunda.trim().length === 0) { 
      setHasilPencarian([]); 
      return; 
    } 
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([])); 
  }, [teksTertunda]); 
  
  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) { 
    setKotaTerpilih(kota); 
    const idSaatIni = ++requestIdRef.current; 
    setSedangMemuat(true); 
    setPesanError(null); 

    // Fitur 2: Simpan ke riwayat pencarian
    if (kota.id !== -1 && kota.name !== "Lokasi Saat Ini") {
      void tambahRiwayatPencarian({
        id: kota.id,
        nama: kota.name,
        latitude: kota.latitude,
        longitude: kota.longitude,
      });
    }
  
    try { 
      const data = await ambilCuacaOfflineFirst( 
         { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude }, 
        { paksaPerbarui } 
      ); 
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan 
      setHasil(data); 
      muatKotaTersimpan(); 
    } catch (err) { 
      if (idSaatIni !== requestIdRef.current) return; 
      setHasil(null); 
      setPesanError( 
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi." 
      ); 
    } finally { 
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false); 
    } 
  } 
  
  async function gunakanLokasiSaatIni() { 
    const status = await mintaIzinLokasi(); 
  
    if (status === "denied") { 
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas."); 
      return; 
    } 
    if (status === "unavailable") { 
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."); 
      return; 
    } 
  
    setPesanLokasi(null); 
    const koordinat = await ambilKoordinatSaatIni(); 
    pilihKota({ 
      id: -1, 
      name: "Lokasi Saat Ini", 
      latitude: koordinat.latitude, 
      longitude: koordinat.longitude, 
      country: "", 
    }); 
  } 

  // Fitur 3: Konfirmasi hapus cache
  function konfirmasiHapusCache(kunci: string, namaKota: string) {
    if (Platform.OS === "web") {
      const yakin = window.confirm(`Yakin hapus cache ${namaKota}?`);
      if (yakin) void hapusCache(kunci);
      return;
    }

    Alert.alert("Konfirmasi Hapus Cache", `Yakin hapus cache cuaca ${namaKota}?`, [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => void hapusCache(kunci) },
    ]);
  }

  async function hapusCache(kunci: string) {
    await hapusSatuCache(kunci);
    muatKotaTersimpan();
  }
  
  return ( 
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}> 
      <ScrollView 
        contentContainerStyle={{ padding: 16, gap: 16 }} 
        keyboardShouldPersistTaps="handled" 
      > 
        <SearchBox onCari={setTeksCari} nilai={teksCari} /> 
  
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} /> 
        {pesanLokasi && <Text accessibilityLabel={pesanLokasi} style={{ color: colors.text }}>{pesanLokasi}</Text>} 
  
        {hasilPencarian.map((kota) => ( 
          <TouchableOpacity key={kota.id} onPress={() => pilihKota(kota)}> 
            <Text style={{ color: colors.text }}>{kota.name}</Text> 
          </TouchableOpacity> 
        ))} 
  
        {kotaTersimpan.length > 0 && ( 
          <View style={{ gap: 6 }}> 
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text> 
            {kotaTersimpan.map((k) => ( 
              <View
                key={k.kunci}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity 
                  onPress={() => 
                    pilihKota({ 
                      id: k.id, 
                      name: k.nama, 
                      latitude: k.latitude, 
                      longitude: k.longitude, 
                      country: "", 
                    }) 
                  } 
                > 
                  <Text style={{ color: colors.text }}>{k.nama}</Text> 
                </TouchableOpacity> 
                <Button
                  title="Hapus Cache"
                  color="red"
                  onPress={() => konfirmasiHapusCache(k.kunci, k.nama)}
                />
              </View>
            ))} 
          </View> 
        )} 
  
        {sedangMemuat && <ActivityIndicator />} 
  
        {pesanError && ( 
          <View> 
            <Text accessibilityLabel={pesanError} style={{ color: colors.text }}>{pesanError}</Text> 
            <Button 
              title="Coba Lagi" 
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)} 
            /> 
          </View> 
        )} 
  
        {hasil && kotaTerpilih && !sedangMemuat && ( 
          <> 
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} /> 
            <WeatherCard 
              kota={kotaTerpilih.name} 
              suhu={hasil.cuaca.saatIni.suhu} 
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)} 
            /> 
            <Text style={{ fontSize: 12, color: "#888888" }}> 
              Kondisi: {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)} {"\u2022"} Angin{" "} 
              {hasil.cuaca.saatIni.kecepatanAngin} km/j 
            </Text> 
            <Button 
              title="Perbarui Sekarang" 
              onPress={() => pilihKota(kotaTerpilih, true)} 
            /> 
            <Button 
              title="Tambahkan ke Favorit" 
              onPress={() => 
                router.push({ 
                  pathname: "/tambah-favorit", 
                  params: { 
                    id: String(kotaTerpilih.id), 
                    nama: kotaTerpilih.name, 
                    lat: String(kotaTerpilih.latitude), 
                    lon: String(kotaTerpilih.longitude), 
                  }, 
                }) 
              } 
            /> 
          </> 
        )} 
  
        <AtribusiCuaca /> 
      </ScrollView> 
    </SafeAreaView> 
  ); 
} 