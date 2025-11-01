import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Smartphone, Sun, Moon } from "lucide-react-native";

import { SelectionCard } from "@/components/settings/SelectionCard/SelectionCard";
import { useTheme, AppearancePreference, Colors, Theme } from "@/theme";
import { ScrollView } from "react-native-gesture-handler";

export default function DarkModeScreen() {
  const { colors, theme, appearancePreference, setAppearancePreference } =
    useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handleSelectTheme = (value: AppearancePreference) => {
    if (value === appearancePreference) return;
    setAppearancePreference(value);
  };

  const themeOptions = [
    {
      value: "system" as AppearancePreference,
      label: "System",
      subtitle: "Follow system appearance",
      icon: Smartphone,
    },
    {
      value: "light" as AppearancePreference,
      label: "Light",
      subtitle: "Always use light mode",
      icon: Sun,
    },
    {
      value: "dark" as AppearancePreference,
      label: "Dark",
      subtitle: "Always use dark mode",
      icon: Moon,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {themeOptions.map((option, index) => (
          <View key={option.value} style={index > 0 && styles.cardSpacing}>
            <SelectionCard
              title={option.label}
              description={option.subtitle}
              icon={option.icon}
              iconColor={colors.secondaryText}
              isSelected={appearancePreference === option.value}
              onSelect={() => handleSelectTheme(option.value)}
              accessibilityLabel={`${option.label} theme`}
              accessibilityHint={option.subtitle}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    cardSpacing: {
      marginTop: theme.spacing.md,
    },
  });
