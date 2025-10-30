import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { ChevronLeft, Smartphone, Sun, Moon } from "lucide-react-native";

import { AnimatedPressable } from "@/components/shared/AnimatedPressable";
import { SelectionCard } from "@/components/settings/SelectionCard/SelectionCard";
import { useTheme, AppearancePreference, Colors, Theme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

export default function DarkModeScreen() {
  const { colors, theme, appearancePreference, setAppearancePreference } =
    useTheme();
  const { safeBack } = useNavigationGuard();
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
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Dark mode",
          headerLeft: () => (
            <AnimatedPressable
              onPress={safeBack}
              hapticIntensity="light"
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <ChevronLeft size={28} color={colors.accent} strokeWidth={2} />
            </AnimatedPressable>
          ),
          headerStyle: {
            backgroundColor: colors.primaryBackground,
          },
          headerTintColor: colors.primaryText,
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          {themeOptions.map((option, index) => (
            <View
              key={option.value}
              style={index > 0 && styles.cardSpacing}
            >
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
      </View>
    </>
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
    backButton: {
      marginLeft: -8,
      padding: 8,
    },
    cardSpacing: {
      marginTop: theme.spacing.md,
    },
  });
