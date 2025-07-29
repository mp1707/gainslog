import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Switch, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Calculator } from "phosphor-react-native";
import { useTheme } from "../../src/providers/ThemeProvider";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { Stepper } from "../../src/shared/ui/atoms/Stepper";
import { PageHeader } from "../../src/shared/ui/molecules/PageHeader";
import { ProteinCalculatorModal } from "../../src/shared/ui/molecules/ProteinCalculatorModal";
import { ProteinCalculationMethod } from "../../src/shared/ui/atoms/ProteinCalculationCard";

export default function SettingsTab() {
  const {
    dailyTargets,
    updateDailyTargetsDebounced,
    loadDailyTargets,
    isLoadingTargets,
    visibleNutritionKeys,
    toggleVisibleNutritionKey,
    loadVisibleNutritionKeys,
    proteinCalculation,
    setProteinCalculation,
    clearProteinCalculation,
  } = useFoodLogStore();

  const [isProteinCalculatorVisible, setIsProteinCalculatorVisible] = useState(false);

  const {
    colors,
    theme: themeObj,
    colorScheme,
    toggleColorScheme,
  } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === 'ios') {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };
  
  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding = tabBarHeight + themeObj.spacing.lg + themeObj.spacing.md;
  
  const styles = useMemo(
    () => createStyles(colors, themeObj, colorScheme, dynamicBottomPadding),
    [colors, themeObj, colorScheme, dynamicBottomPadding]
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

  const handleProteinCalculationSelect = (
    method: ProteinCalculationMethod,
    bodyWeight: number,
    calculatedProtein: number
  ) => {
    setProteinCalculation(method, bodyWeight, calculatedProtein);
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
    const isProteinCard = config.key === 'protein';
    
    return (
      <View style={styles.nutritionCard} key={config.key}>
        <View style={styles.cardHeader}>
          <Text style={styles.nutritionHeadline}>{config.label}</Text>
          {isProteinCard && (
            <TouchableOpacity
              style={styles.calculateButton}
              onPress={() => setIsProteinCalculatorVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Open protein calculator"
              accessibilityHint="Calculate protein needs based on body weight and activity level"
            >
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Show selected calculation method for protein */}
        {isProteinCard && proteinCalculation && (
          <View style={styles.calculationInfo}>
            <Text style={styles.calculationText}>
              {proteinCalculation.method.title} ({proteinCalculation.bodyWeight}kg)
            </Text>
            <Text style={styles.calculatedValue}>
              Calculated: {proteinCalculation.calculatedProtein}g protein
            </Text>
            <Text style={styles.calculationSubtext}>
              {proteinCalculation.method.description}
            </Text>
          </View>
        )}

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
      <SafeAreaView style={[styles.container, styles.centered]} edges={['top', 'left', 'right']}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          {renderAppearanceCard()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Tracking</Text>
          {nutritionConfigs.map(renderNutritionCard)}
        </View>
      </ScrollView>

      <ProteinCalculatorModal
        visible={isProteinCalculatorVisible}
        onClose={() => setIsProteinCalculatorVisible(false)}
        onSelectMethod={handleProteinCalculationSelect}
        initialBodyWeight={proteinCalculation?.bodyWeight || 70}
      />
    </SafeAreaView>
  );
}

// Dynamic styles factory
const createStyles = (
  colors: ReturnType<typeof useTheme>["colors"],
  themeObj: typeof import("../../src/theme").theme,
  scheme: import("../../src/theme").ColorScheme,
  bottomPadding?: number
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
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
      paddingBottom: bottomPadding || spacing.xl,
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
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      fontWeight: typography.Title2.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.md,
    },
    nutritionCard: {
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...componentStyles.cards,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    nutritionHeadline: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    calculateButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calculateButtonText: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      fontWeight: typography.Button.fontWeight,
      color: colors.white,
    },
    calculationInfo: {
      backgroundColor: scheme === 'light' 
        ? 'rgba(255, 122, 90, 0.05)' 
        : 'rgba(255, 122, 90, 0.1)',
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
    },
    calculationText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Body.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs,
    },
    calculatedValue: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Headline.fontWeight, // Make it semibold to stand out
      color: colors.accent,
      marginBottom: spacing.xs,
    },
    calculationSubtext: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
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
      fontWeight: typography.Body.fontWeight,
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
