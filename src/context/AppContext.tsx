import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { setDbUserScope } from "../db";
import { firebaseReady, firebaseSignOut, subscribeFirebaseAuth } from "../firebase";
import type { Language, ThemeMode } from "../types";
import { t } from "../i18n";

type AppSettings = {
  language: Language;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  /** `undefined` while Firebase auth is still resolving (only when Firebase is configured). */
  firebaseUid: string | null | undefined;
  isFirebaseConfigured: boolean;
  signOutFirebase: () => Promise<void>;
  setLanguage: (value: Language) => Promise<void>;
  setThemeMode: (value: ThemeMode) => Promise<void>;
  setNotificationsEnabled: (value: boolean) => Promise<void>;
  tr: (key: string) => string;
};

const STORAGE_KEYS = {
  language: "app.language",
  theme: "app.theme",
  notifications: "app.notifications",
} as const;

const AppContext = createContext<AppSettings | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const isFirebaseConfigured = firebaseReady();
  const [language, setLanguageState] = useState<Language>("en");
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(false);
  const [firebaseUid, setFirebaseUid] = useState<string | null | undefined>(() =>
    isFirebaseConfigured ? undefined : null,
  );

  useEffect(() => {
    (async () => {
      const [lang, theme, notif] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.language),
        AsyncStorage.getItem(STORAGE_KEYS.theme),
        AsyncStorage.getItem(STORAGE_KEYS.notifications),
      ]);
      if (lang === "en" || lang === "ru") setLanguageState(lang);
      if (theme === "light" || theme === "dark") setThemeModeState(theme);
      if (notif === "true" || notif === "false") setNotificationsEnabledState(notif === "true");
    })();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setDbUserScope(null);
      setFirebaseUid(null);
      return;
    }
    return subscribeFirebaseAuth((user) => {
      setDbUserScope(user?.uid ?? null);
      setFirebaseUid(user?.uid ?? null);
    });
  }, [isFirebaseConfigured]);

  const signOutFirebase = useCallback(async () => {
    await firebaseSignOut();
  }, []);

  const setLanguage = async (value: Language) => {
    setLanguageState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.language, value);
  };

  const setThemeMode = async (value: ThemeMode) => {
    setThemeModeState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.theme, value);
  };

  const setNotificationsEnabled = async (value: boolean) => {
    setNotificationsEnabledState(value);
    await AsyncStorage.setItem(STORAGE_KEYS.notifications, String(value));
  };

  const value = useMemo<AppSettings>(
    () => ({
      language,
      themeMode,
      notificationsEnabled,
      firebaseUid,
      isFirebaseConfigured,
      signOutFirebase,
      setLanguage,
      setThemeMode,
      setNotificationsEnabled,
      tr: (key: string) => t(language, key),
    }),
    [language, themeMode, notificationsEnabled, firebaseUid, isFirebaseConfigured, signOutFirebase],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppSettings() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppSettings must be used inside AppProvider");
  return context;
}
