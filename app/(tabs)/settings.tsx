import React, { useEffect, useMemo } from "react";
import { View, Text, ScrollView, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/providers/ThemeProvider";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { Stepper } from "../../src/shared/ui/atoms/Stepper";
import { PageHeader } from "../../src/shared/ui/molecules/PageHeader";

export default function SettingsTab() {
  const {
    dailyTargets,
    updateDailyTargetsDebounced,
    loadDailyTargets,
    isLoadingTargets,
    visibleNutritionKeys,
    toggleVisibleNutritionKey,
    loadVisibleNutritionKeys,
  } = useFoodLogStore();

  const {
    colors,
    theme: themeObj,
    colorScheme,
    toggleColorScheme,
  } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, themeObj, colorScheme),
    [colors, themeObj, colorScheme]
  );

  useEffect(() => {
    loadDailyTargets();
    loadVisibleNutritionKeys();
  }, []);

  const handleTargetChange = (
    key: keyof typeof dailyTargets,
    value: number
  ) => {
    const newTargets = {
      ...dailyTargets,
      [key]: value,
    };
    updateDailyTargetsDebounced(newTargets);
  };

  const nutritionConfigs: Array<{
    key: keyof typeof dailyTargets;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
  }> = [
    {
      key: "calories",
      label: "Calories",
      unit: "kcal",
      min: 1000,
      max: 5000,
      step: 50,
    },
    { key: "protein", label: "Protein", unit: "g", min: 50, max: 500, step: 5 },
    { key: "carbs", label: "Carbs", unit: "g", min: 50, max: 500, step: 5 },
    { key: "fat", label: "Fat", unit: "g", min: 20, max: 500, step: 5 },
  ];

  const renderNutritionCard = (config: (typeof nutritionConfigs)[number]) => {
    const switchValue = visibleNutritionKeys.includes(config.key as any);
    return (
      <View style={styles.nutritionCard} key={config.key}>
        <Text style={styles.nutritionHeadline}>{config.label}</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Daily Target</Text>
          <Stepper
            value={dailyTargets[config.key]}
            min={config.min}
            max={config.max}
            step={config.step}
            onChange={(value) => handleTargetChange(config.key, value)}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Show Progress Bar</Text>
          <Switch
            value={switchValue}
            onValueChange={() => toggleVisibleNutritionKey(config.key as any)}
          />
        </View>
      </View>
    );
  };

  const renderAppearanceCard = () => {
    return (
      <View style={styles.nutritionCard}>
        <Text style={styles.nutritionHeadline}>Appearance</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={colorScheme === "dark"}
            onValueChange={toggleColorScheme}
            accessibilityLabel="Toggle theme"
          />
        </View>
      </View>
    );
  };

  if (isLoadingTargets) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>
          Customize your nutrition tracking preferences
        </Text>
      </PageHeader>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderAppearanceCard()}
        {nutritionConfigs.map(renderNutritionCard)}
      </ScrollView>
    </SafeAreaView>
  );
}

// Dynamic styles factory
const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  themeObj: typeof import("../../src/theme").theme,
  scheme: import("../../src/theme").ColorScheme
) => {
  const componentStyles = themeObj.getComponentStyles(scheme);
  const { typography, spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
    },
    pageTitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      fontWeight: typography.Title2.fontWeight,
      color: colors.primaryText,
    },
    pageSubtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 22,
    },
    nutritionCard: {
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      ...componentStyles.cards,
    },
    nutritionHeadline: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.lg,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
    },
    settingLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      flex: 1,
    },
    loadingText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },
  });
};
