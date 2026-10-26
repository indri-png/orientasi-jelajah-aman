// src/components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput } from "react-native";

interface SearchBoxProps {
  onCari: (teks: string) => void;
  nilai?: string;
}

export default function SearchBox({ onCari, nilai }: SearchBoxProps) {
  const [teks, setTeks] = useState(nilai ?? "");

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // kirim setiap perubahan, debounce diatur di pemanggilnya
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        value={nilai !== undefined ? nilai : teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{ borderWidth: 1, padding: 8, borderRadius: 8 }}
      />
    </View>
  );
}