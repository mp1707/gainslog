import React from "react";
import { View, Text, Switch } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./AppearanceCard.styles";

export const AppearanceCard: React.FC = () => {
  const { colors, theme: themeObj, colorScheme, toggleColorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);

  return (
    <View style={styles.nutritionCard}>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Text style={styles.settingSubtext}>
            Choose between light and dark appearance
          </Text>
        </View>
        <Switch
          value={colorScheme === "dark"}
          onValueChange={toggleColorScheme}
          accessibilityLabel="Toggle theme"
        />
      </View>
    </View>
  );
};