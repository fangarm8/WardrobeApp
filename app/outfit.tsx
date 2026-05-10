import { Image } from "expo-image";
import { Link } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "../src/context/AppContext";
import {
  firebaseReady,
  subscribeWardrobeItems,
  removeWardrobeItemRemote,
  type RemoteWardrobeItem,
} from "../src/firebase";

export default function OutfitScreen() {
  const { tr, firebaseUid } = useAppSettings();
  const { colors } = useTheme();
  const [items, setItems] = useState<RemoteWardrobeItem[]>([]);

  useEffect(() => {
    if (!firebaseReady() || !firebaseUid) return;
    const unsub = subscribeWardrobeItems(firebaseUid, setItems);
    return () => unsub();
  }, [firebaseUid]);

  if (!firebaseReady() || !firebaseUid) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.hint, { color: colors.text }]}>{tr("signInToSync")}</Text>
        <Link href="/login" style={styles.loginLink}>
          {tr("login")}
        </Link>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{tr("cloudWardrobe")}</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>{tr("cloudWardrobeHint")}</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ color: colors.text, marginTop: 20, textAlign: "center" }}>
            {tr("noItems")}
          </Text>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { borderColor: colors.border }]}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
            ) : null}
            <View style={styles.cardBody}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.itemMeta, { color: colors.text }]}>
                {item.category} · {item.date}
              </Text>
              {item.description ? (
                <Text style={{ color: colors.text }} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            <Pressable
              style={[styles.deleteBtn, { borderColor: colors.border }]}
              onPress={() => void removeWardrobeItemRemote(item.id, firebaseUid)}
            >
              <Text style={{ color: "#c62828" }}>{tr("delete")}</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, opacity: 0.6, marginBottom: 16 },
  hint: { fontSize: 16, textAlign: "center", marginBottom: 16 },
  loginLink: { color: "#0a7ea4", fontWeight: "600", fontSize: 16 },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  image: { width: "100%", height: 180 },
  cardBody: { padding: 10, gap: 4 },
  itemTitle: { fontSize: 16, fontWeight: "600" },
  itemMeta: { fontSize: 13, opacity: 0.7 },
  deleteBtn: {
    margin: 10,
    marginTop: 0,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
});
