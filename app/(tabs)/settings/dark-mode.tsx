import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Smartphone, Sun, Moon } from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { SelectionCard } from "@/components/settings/SelectionCard/SelectionCard";
import { useTheme, AppearancePreference, Colors, Theme } from "@/theme";
import { ScrollView } from "react-native-gesture-handler";

export default function DarkModeScreen() {
  const { t } = useTranslation();
  const { colors, theme, appearancePreference, setAppearancePreference } =
    useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handleSelectTheme = (value: AppearancePreference) => {
    if (value === appearancePreference) return;
    setAppearancePreference(value);
  };

  const themeOptions = useMemo(
    () => [
      {
        value: "system" as AppearancePreference,
        label: t("settings.darkMode.options.system.label"),
        subtitle: t("settings.darkMode.options.system.subtitle"),
        icon: Smartphone,
      },
      {
        value: "light" as AppearancePreference,
        label: t("settings.darkMode.options.light.label"),
        subtitle: t("settings.darkMode.options.light.subtitle"),
        icon: Sun,
      },
      {
        value: "dark" as AppearancePreference,
        label: t("settings.darkMode.options.dark.label"),
        subtitle: t("settings.darkMode.options.dark.subtitle"),
        icon: Moon,
      },
    ],
    [t]
  );

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
              accessibilityLabel={t(
                "settings.darkMode.accessibility.optionLabel",
                {
                  option: option.label,
                }
              )}
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
