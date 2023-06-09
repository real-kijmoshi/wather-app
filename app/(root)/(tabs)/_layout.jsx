import { Tabs } from "expo-router";

const TabsLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen name="weather" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
};

export default TabsLayout;
