import React from "react";
import { View, Switch, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { SettingCard } from "@/components/settings/SettingCard/SettingCard";
import { AppText } from "src/components";

export const AppearanceCard: React.FC = () => {
  const { theme, colorScheme, toggleColorScheme } = useTheme();

  const styles = StyleSheet.create({
    settingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    settingInfo: {
      flex: 1,
      marginRight: theme.spacing.lg,
    },
    settingLabel: {
      marginBottom: theme.spacing.xs / 2,
    },
  });

  return (
    <SettingCard>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <AppText role="Headline" style={styles.settingLabel}>
            Dark Mode
          </AppText>
          <AppText role="Body" color="secondary">
            Choose between light and dark appearance
          </AppText>
        </View>
        <Switch
          value={colorScheme === "dark"}
          onValueChange={toggleColorScheme}
          accessibilityLabel="Toggle theme"
        />
      </View>
    </SettingCard>
  );
};
