import { View, Text } from "react-native";
import { LaporanUdara } from "../types/cuaca";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

export default function IndikatorAQI({ data }: IndikatorAQIProps) {
  const warna =
    data.tingkat === "BAIK"
      ? "green"
      : data.tingkat === "SEDANG"
      ? "orange"
      : data.tingkat === "TIDAK_SEHAT"
      ? "red"
      : "purple";

  return (
    <View style={{ padding: 16, borderRadius: 8 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18 }}>
        {data.kota}
      </Text>

      <Text style={{ fontSize: 24 }}>
        AQI: {data.indeksAQI}
      </Text>

      <Text style={{ color: warna }}>
        Tingkat: {data.tingkat}
      </Text>

      {data.diperbaruiPada && (
        <Text>Diperbarui: {data.diperbaruiPada}</Text>
      )}
    </View>
  );
}