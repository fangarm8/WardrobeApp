import { useLocalSearchParams, router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Button, Share, StyleSheet, Text, TextInput, View } from "react-native";

import { useAppSettings } from "../src/context/AppContext";
import { deleteItem, initDb, listItems, updateItem } from "../src/db";
import type { WardrobeItem } from "../src/types";

export default function DetailsScreen() {
  const { tr, firebaseUid, isFirebaseConfigured } = useAppSettings();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<WardrobeItem | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isFirebaseConfigured && firebaseUid === undefined) return;
    setLoaded(false);
    (async () => {
      await initDb();
      const items = await listItems();
      const found = items.find((entry) => String(entry.id) === id);
      setItem(found ?? null);
      setLoaded(true);
    })();
  }, [id, firebaseUid, isFirebaseConfigured]);

  if (isFirebaseConfigured && firebaseUid === undefined) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{tr("loading")}</Text>
      </View>
    );
  }

  if (!loaded) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{tr("loading")}</Text>
      </View>
    );
  }

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{tr("notFound")}</Text>
      </View>
    );
  }

  const onSave = async () => {
    await updateItem(item);
    router.back();
  };

  const onDelete = async () => {
    await deleteItem(item.id);
    router.replace("/");
  };

  const onShare = async () => {
    await Share.share({
      message: `${item.title}\n${item.description}\n${item.category}`,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={item.title} onChangeText={(value) => setItem({ ...item, title: value })} />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={item.description}
        onChangeText={(value) => setItem({ ...item, description: value })}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={item.category}
        onChangeText={(value) => setItem({ ...item, category: value })}
      />
      <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={item.date} onChangeText={(value) => setItem({ ...item, date: value })} />
      <Button title={tr("save")} onPress={onSave} />
      <Button title={tr("delete")} onPress={onDelete} />
      <Button title={tr("share")} onPress={onShare} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
});
