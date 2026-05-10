import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useAppSettings } from "../src/context/AppContext";
import { createItem, initDb } from "../src/db";
import { firebaseReady, uploadWardrobeImage, addWardrobeItemRemote } from "../src/firebase";

export default function AddScreen() {
  const { tr, firebaseUid } = useAppSettings();
  const { colors } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const onOpenCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.6 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const onSave = async () => {
    if (isSaving) return;
    if (!title.trim() || !description.trim() || !category.trim()) {
      setError("Please fill title, description and category.");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const itemData = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        date: date.trim(),
        imageUri,
      };

      await initDb();
      await createItem(itemData);

      // Auto-sync to Firestore if the user is signed in
      if (firebaseReady() && firebaseUid) {
        let imageUrl: string | undefined;
        if (imageUri) {
          try {
            imageUrl = await uploadWardrobeImage(imageUri, firebaseUid);
          } catch {
            // Image upload failed — save item without remote image
          }
        }
        try {
          await addWardrobeItemRemote(itemData, firebaseUid, imageUrl);
        } catch {
          // Firestore write failed — local save already succeeded
        }
      }

      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save item.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={title}
        onChangeText={setTitle}
        placeholder={tr("title")}
        placeholderTextColor={colors.border}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={description}
        onChangeText={setDescription}
        placeholder={tr("description")}
        placeholderTextColor={colors.border}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={category}
        onChangeText={setCategory}
        placeholder={tr("category")}
        placeholderTextColor={colors.border}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={date}
        onChangeText={setDate}
        placeholder={tr("date")}
        placeholderTextColor={colors.border}
      />
      <Button title={tr("openCamera")} onPress={onOpenCamera} disabled={isSaving} />
      {imageUri ? (
        <Text style={{ color: colors.text }} numberOfLines={1}>
          {tr("photoSelected")}: {imageUri.split("/").pop()}
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button title={isSaving ? tr("saving") : tr("save")} onPress={onSave} disabled={isSaving} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
  error: { color: "#c62828" },
});
