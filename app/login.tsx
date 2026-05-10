import { router } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useAppSettings } from "../src/context/AppContext";
import { firebaseReady, login } from "../src/firebase";

const firebaseDevHint =
  "Dev: copy .env.example to .env, add your Firebase web config, restart Expo.";

export default function LoginScreen() {
  const { tr } = useAppSettings();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const onLogin = async () => {
    if (!firebaseReady()) {
      setMessage(__DEV__ ? `${firebaseDevHint}` : tr("signInUnavailable"));
      return;
    }
    try {
      await login(email, password);
      setMessage("Logged in");
      router.replace("/");
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={email}
        onChangeText={setEmail}
        placeholder={tr("email")}
        placeholderTextColor={colors.border}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        value={password}
        onChangeText={setPassword}
        placeholder={tr("password")}
        placeholderTextColor={colors.border}
        secureTextEntry
      />
      <Button title={tr("login")} onPress={onLogin} />
      <Text style={{ color: colors.text }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
});
