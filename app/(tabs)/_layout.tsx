import { Tabs } from "expo-router";

import { useAppSettings } from "../../src/context/AppContext";

export default function TabsLayout() {
  const { tr } = useAppSettings();

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: tr("home") }} />
      <Tabs.Screen name="explore" options={{ title: tr("explore") }} />
    </Tabs>
  );
}
