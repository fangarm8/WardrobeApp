import { Link } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { useAppSettings } from "../src/context/AppContext";
import { checkLocalDbHealth, getLocalDbStorageLabel } from "../src/db";
import { disableAllNotifications, enableDailyReminder } from "../src/notifications";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const {
    tr,
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    notificationsEnabled,
    setNotificationsEnabled,
    firebaseUid,
    isFirebaseConfigured,
    signOutFirebase,
  } = useAppSettings();
  const [dbMessage, setDbMessage] = useState<string | null>(null);

  const onToggleNotifications = async (value: boolean) => {
    if (value) {
      const granted = await enableDailyReminder();
      await setNotificationsEnabled(granted);
    } else {
      await disableAllNotifications();
      await setNotificationsEnabled(false);
    }
  };

  const activeBackground = themeMode === "dark" ? "#1f3b4a" : "#dff4ff";
  const buttonTextColor = colors.text;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={{ color: colors.text }}>{tr("currentTheme")}</Text>
        <View style={styles.optionRow}>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border, backgroundColor: "transparent" },
              themeMode === "light" && [styles.optionButtonActive, { backgroundColor: activeBackground, borderColor: colors.primary }],
            ]}
            onPress={() => void setThemeMode("light")}
          >
            <Text style={{ color: buttonTextColor }}>{tr("light")}</Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border, backgroundColor: "transparent" },
              themeMode === "dark" && [styles.optionButtonActive, { backgroundColor: activeBackground, borderColor: colors.primary }],
            ]}
            onPress={() => void setThemeMode("dark")}
          >
            <Text style={{ color: buttonTextColor }}>{tr("dark")}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={{ color: colors.text }}>{tr("currentLanguage")}</Text>
        <View style={styles.optionRow}>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border, backgroundColor: "transparent" },
              language === "en" && [styles.optionButtonActive, { backgroundColor: activeBackground, borderColor: colors.primary }],
            ]}
            onPress={() => void setLanguage("en")}
          >
            <Text style={{ color: buttonTextColor }}>EN</Text>
          </Pressable>
          <Pressable
            style={[
              styles.optionButton,
              { borderColor: colors.border, backgroundColor: "transparent" },
              language === "ru" && [styles.optionButtonActive, { backgroundColor: activeBackground, borderColor: colors.primary }],
            ]}
            onPress={() => void setLanguage("ru")}
          >
            <Text style={{ color: buttonTextColor }}>RU</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.row}>
        <Text style={{ color: colors.text }}>{tr("notifyDaily")}</Text>
        <Switch value={notificationsEnabled} onValueChange={(value) => void onToggleNotifications(value)} />
      </View>
      <View style={styles.section}>
        <Text style={{ color: colors.text, fontWeight: "600" }}>{tr("localWardrobe")}</Text>
        <Text style={{ color: colors.text }}>
          {firebaseUid ? tr("signedInStorage") : tr("guestStorage")}
        </Text>
        <Text style={{ color: colors.text }}>
          {tr("localDbScope")}: {getLocalDbStorageLabel()}
        </Text>
        <Pressable
          style={[styles.optionButton, { borderColor: colors.border }]}
          onPress={() => {
            void (async () => {
              const r = await checkLocalDbHealth();
              setDbMessage(
                `${r.ok ? tr("dbStatusOk") : tr("dbStatusFail")}: ${r.message} · ${tr("dbItemCount")}: ${r.itemCount}`,
              );
            })();
          }}
        >
          <Text style={{ color: colors.text }}>{tr("dbTest")}</Text>
        </Pressable>
        {dbMessage ? <Text style={{ color: colors.text }}>{dbMessage}</Text> : null}
      </View>
      <Link href="/register" style={styles.link}>{tr("register")}</Link>
      <Link href="/login" style={styles.link}>{tr("login")}</Link>
      {isFirebaseConfigured && firebaseUid ? (
        <Pressable
          style={[styles.optionButton, { borderColor: colors.border }]}
          onPress={() => void signOutFirebase()}
        >
          <Text style={{ color: colors.text }}>{tr("signOut")}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  section: { gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  optionRow: { flexDirection: "row", gap: 8 },
  optionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  optionButtonActive: {
    borderWidth: 1,
  },
  link: { color: "#0a7ea4", fontWeight: "600" },
});
