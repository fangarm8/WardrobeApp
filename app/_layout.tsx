import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

import { AppProvider, useAppSettings } from "../src/context/AppContext";

void SplashScreen.preventAutoHideAsync();

function AppNavigation() {
  const { themeMode, tr } = useAppSettings();

  useEffect(() => {
    const timer = setTimeout(() => {
      void SplashScreen.hideAsync();
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider value={themeMode === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: tr("home") }} />
        <Stack.Screen name="add" options={{ title: tr("addItem") }} />
        <Stack.Screen name="details" options={{ title: tr("details") }} />
        <Stack.Screen name="settings" options={{ title: tr("settings") }} />
        <Stack.Screen name="login" options={{ title: tr("login") }} />
        <Stack.Screen name="register" options={{ title: tr("register") }} />
        <Stack.Screen name="outfit" options={{ title: tr("cloudWardrobe") }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AppNavigation />
    </AppProvider>
  );
}
