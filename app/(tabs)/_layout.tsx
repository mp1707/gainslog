import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { colors } from "../../src/theme";
import { StyleSheet } from "react-native";

function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
          >
            {options.tabBarIcon &&
              options.tabBarIcon({
                color: isFocused ? colors.brand.primary : colors.text.secondary,
                size: 24,
              })}
            <Text
              style={[
                styles.tabLabel,
                {
                  color: isFocused
                    ? colors.brand.primary
                    : colors.text.secondary,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="calendar-check-o" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="overview"
        options={{
          title: "Overview",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="bar-chart" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingBottom: 20,
    paddingTop: 8,
    alignItems: "center",
    justifyContent: "space-around",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});
