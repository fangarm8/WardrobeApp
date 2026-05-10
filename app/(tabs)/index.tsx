import { Link } from "expo-router";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import { useCallback } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { useAppSettings } from "../../src/context/AppContext";
import { useWardrobeViewModel } from "../../src/viewmodels/useWardrobeViewModel";

export default function HomeScreen() {
  const vm = useWardrobeViewModel();
  const { refresh } = vm;
  const { tr, firebaseUid } = useAppSettings();
  const { colors } = useTheme();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{tr("appTitle")}</Text>
      <Text style={[styles.authStatus, { color: colors.text }]}>
        {firebaseUid ? `● ${tr("signedIn")}` : `○ ${tr("guest")}`}
      </Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={vm.searchQuery}
        onChangeText={vm.setSearchQuery}
        placeholder={tr("search")}
        placeholderTextColor={colors.border}
      />
      <View style={styles.row}>
        <Pressable
          style={styles.button}
          onPress={() => vm.setSortType(vm.sortType === "newest" ? "oldest" : "newest")}
        >
          <Text style={{ color: colors.text }}>{vm.sortType === "newest" ? tr("sortNewest") : tr("sortOldest")}</Text>
        </Pressable>
        <Link href="/add" style={styles.link}>
          {tr("addItem")}
        </Link>
      </View>
      <View style={styles.row}>
        {vm.categories.slice(0, 4).map((category) => (
          <Pressable key={category} style={styles.tag} onPress={() => vm.setCategoryFilter(category)}>
            <Text style={{ color: colors.text }}>{category}</Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={vm.visibleItems}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/details", params: { id: String(item.id) } }}
            style={styles.card}
          >
            {item.title} - {item.category} ({item.date})
          </Link>
        )}
        ListEmptyComponent={<Text style={{ color: colors.text }}>{tr("noItems")}</Text>}
      />
      <View style={styles.row}>
        <Link href="/settings" style={styles.link}>
          {tr("settings")}
        </Link>
        <Link href="/login" style={styles.link}>
          {tr("login")}
        </Link>
        <Link href="/outfit" style={styles.link}>
          {tr("remote")}
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 20, fontWeight: "700" },
  authStatus: { fontSize: 12, opacity: 0.6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  button: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8 },
  tag: { borderWidth: 1, borderColor: "#ddd", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  card: { padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 8 },
  link: { color: "#0a7ea4", fontWeight: "600" },
});
