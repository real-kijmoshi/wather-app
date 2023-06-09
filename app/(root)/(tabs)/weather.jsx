import { Alert, Image, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SecureStore from "expo-secure-store";
import RNEA from "react-native-exit-app";
import { useRouter } from "expo-router";
import {
  getCurrentPositionAsync,
  requestForegroundPermissionsAsync,
  getForegroundPermissionsAsync,
} from "expo-location";

const App = () => {
  const [currentData, setCurrentData] = useState(null);
  const [nextDaysData, setNextDaysData] = useState(null);

  const [city, setCity] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [units, setUnits] = useState("metic");

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await getForegroundPermissionsAsync();
      if (status !== "granted") {
        const { status: perms } = await requestForegroundPermissionsAsync();
        if (perms !== "granted") {
          RNEA.exitApp();
          throw new Error("Location permission not granted");
        }
      }

      setApiKey(await SecureStore.getItemAsync("api-key"));
      if (!apiKey) {
        Alert.alert(
          "No API key",
          "You need to set an API key in the settings tab",
          [
            {
              text: "Settings",
              onPress: () => {
                router.push("/settings");
              },
            },
          ]
        );
      }

      setUnits((await SecureStore.getItemAsync("units")) || "metric");

      const { coords } = await getCurrentPositionAsync();
      const { latitude, longitude } = coords;

      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`
      )
        .then((res) => res.json())
        .then((data) => {
          setCurrentData(data);
        });

      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&cnt=5&appid=${apiKey}&units=${units}`
      )
        .then((res) => res.json())
        .then((data) => {
          setNextDaysData(data?.list);
        });
    })();
  }, []);

  useEffect(() => {
    if (!city) return;

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}&cnt=96`
    )
      .then((res) => res.json())
      .then((data) => {
        setCurrentData(data);
      });

    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&cnt=5&appid=${apiKey}&units=${units}`
    )
      .then((res) => res.json())
      .then((data) => {
        setNextDaysData(data?.list);
      })
      .catch((e) => {
        console.log(error)
      });
  }, [city]);

  return (
    <SafeAreaView style={styles.main}>
      <StatusBar style="auto" />

      <View style={styles.position}>
        <Text>City: </Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => setCity(value)}
          value={city || currentData?.name}
        />
      </View>

      <View style={styles.weather}>
        <View style={styles.row}>
          <Text style={styles.weatherTitle}>
            {currentData?.name} ({currentData?.sys?.country})
          </Text>
          <Image
            style={{ width: 70, height: 70 }}
            source={{
              uri: `https://openweathermap.org/img/w/${
                currentData?.weather
                  ? currentData.weather[0]?.icon ?? "04d"
                  : "04d"
              }.png`,
            }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.weatherInfo}>
            <Text>Temperature: </Text>
            <Text>
              {currentData?.main?.temp} °{units == "metric" ? "C" : "F"}
            </Text>
          </View>

          <View style={styles.weatherInfo}>
            <Text>Feels like: </Text>
            <Text>
              {currentData?.main?.feels_like} °{units == "metric" ? "C" : "F"}
            </Text>
          </View>

          <View style={styles.weatherInfo}>
            <Text>Humidity: </Text>
            <Text>{currentData?.main?.humidity}%</Text>
          </View>
        </View>
      </View>

      <View
        style={{
          backgroundColor: "rgba(100, 100, 100, 0.5)",
          width: "100%",
          height: 1,
          margin: 20,
        }}
      />

      <View style={styles.nextDays}>
        {nextDaysData &&
          nextDaysData?.slice(0, 5)?.map((hour) => (
            <View key={hour.dt} style={styles.weatherNext}>
              <View style={styles.row}>
                <Text style={styles.weatherTitle}>
                  {hour.dt_txt.slice(-9, -3)}
                </Text>

                <Image
                  style={{ width: 70, height: 70 }}
                  source={{
                    uri: `https://openweathermap.org/img/w/${
                      hour?.weather
                        ? hour.weather[0]?.icon ?? ""
                        : ""
                    }.png`,
                  }}
                />
              </View>

              <Text>
                {hour?.main?.temp} °{units == "metric" ? "C" : "F"}
              </Text>
            </View>
          ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    alignItems: "center",
    padding: 14,
    paddingTop: 0,
    width: "100%",
    margin: 0,
    backgroundColor: "lightblue",
    flex: 1,
  },
  position: {
    position: "absolute",
    top: 0,
    left: 0,
    color: "white",
    flex: 1,
    flexDirection: "row",
    fontSize: 15,
  },
  weather: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: "80%",
    height: "20%",
    borderRadius: 10,
    padding: 10,
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weatherInfo: {
    flex: 1,
    alignItems: "center",
  },

  nextDays: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  weatherNext: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    width: "80%",
    height: 80,
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
});

export default App;
