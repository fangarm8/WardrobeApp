import NetInfo from "@react-native-community/netinfo";
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAppSettings } from "../../src/context/AppContext";
import { fetchWeather } from "../../src/weather";

export default function ExploreScreen() {
  const { tr } = useAppSettings();
  const { colors } = useTheme();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [temperature, setTemperature] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number>(0);
  const [fromCache, setFromCache] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(Boolean(state.isConnected));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      const result = await fetchWeather(isConnected);
      setTemperature(result.data.temperature);
      setWindSpeed(result.data.windSpeed);
      setFromCache(result.fromCache);
    })();
  }, [isConnected]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>{tr("weather")}</Text>
      <Text style={{ color: colors.text }}>{isConnected ? tr("online") : tr("offlineShort")}</Text>
      <Text style={{ color: colors.text }}>{tr("temp")}: {temperature} C</Text>
      <Text style={{ color: colors.text }}>{tr("wind")}: {windSpeed} km/h</Text>
      <Text style={{ color: colors.text }}>{fromCache ? tr("offline") : tr("online")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16, gap: 8 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
});
