import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";

import * as SecureStore from "expo-secure-store";

const settings = () => {
  const [apiKey, setApiKey] = useState("no api key");

  useEffect(() => {
    SecureStore.getItemAsync("api-key").then((key) => {
      setApiKey(key);
    });
  }, []);

  const changeUnit = (units) => {
    SecureStore.setItemAsync("units", units);
  };

  const onChangeText = (text) => {
    SecureStore.setItemAsync("api-key", text);
    setApiKey(text);
  };

  return (
    <SafeAreaView>
      <Text>Api key: </Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={apiKey}
      />

      <Text>Units: </Text>
      <View>
        <Button onPress={() => changeUnit("metric")} title="metric" />
        
        <Button onPress={() => changeUnit("imperial")} title="imperial" />
      </View>
    </SafeAreaView>
  );
};

export default settings;

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
