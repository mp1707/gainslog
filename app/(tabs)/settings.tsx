import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { CalculatorIcon } from "phosphor-react-native";
import { useTheme } from "../../src/providers/ThemeProvider";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { Stepper } from "../../src/shared/ui/atoms/Stepper";
import { ProteinCalculatorModal } from "../../src/shared/ui/molecules/ProteinCalculatorModal";
import { ProteinCalculationMethod } from "../../src/shared/ui/atoms/ProteinCalculationCard";
import { CalorieCalculatorModal } from "../../src/shared/ui/molecules/CalorieCalculatorModal";
import { CALCULATION_METHODS } from "../../src/shared/ui/atoms/CalorieCalculationCard";
import { GoalType } from "../../src/shared/ui/atoms/GoalSelectionCard";
import {
  CalorieIntakeParams,
  ActivityLevel,
} from "../../src/utils/calculateCalories";

export default function SettingsTab() {
  const {
    dailyTargets,
    updateDailyTargetsDebounced,
    loadDailyTargets,
    isLoadingTargets,
    proteinCalculation,
    setProteinCalculation,
    calorieCalculation,
    setCalorieCalculation,
  } = useFoodLogStore();

  const [isProteinCalculatorVisible, setIsProteinCalculatorVisible] =
    useState(false);
  const [isCalorieCalculatorVisible, setIsCalorieCalculatorVisible] =
    useState(false);

  const {
    colors,
    theme: themeObj,
    colorScheme,
    toggleColorScheme,
  } = useTheme();
  const insets = useSafeAreaInsets();

  // Calculate platform-specific tab bar height for Expo Router
  const getTabBarHeight = () => {
    if (Platform.OS === "ios") {
      // iOS tab bar: 49px standard height + bottom safe area
      return 49 + insets.bottom;
    } else {
      // Android tab bar: 56px standard height
      return 56;
    }
  };

  const tabBarHeight = getTabBarHeight();
  const dynamicBottomPadding =
    tabBarHeight + themeObj.spacing.lg + themeObj.spacing.md;

  const styles = useMemo(
    () => createStyles(colors, themeObj, colorScheme, dynamicBottomPadding),
    [colors, themeObj, colorScheme, dynamicBottomPadding]
  );

  useEffect(() => {
    loadDailyTargets();
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

  const handleCalorieGoalSelect = (
    goalType: GoalType,
    calories: number,
    params: CalorieIntakeParams,
    activityLevel: ActivityLevel
  ) => {
    // Create method object from activity level for store compatibility
    const method = CALCULATION_METHODS[activityLevel];

    // Store the calorie calculation in the store
    setCalorieCalculation(method, params, activityLevel, calories, goalType);

    // Update the calorie target based on selected goal
    handleTargetChange("calories", calories);
  };

  const getCardDescription = (key: keyof typeof dailyTargets): string => {
    switch (key) {
      case "calories":
        return "Energy from food to fuel your daily activities";
      case "protein":
        return "Essential for muscle growth and recovery";
      case "carbs":
        return "Primary energy source for your body and brain";
      case "fat":
        return "Important for hormone production and nutrient absorption";
      default:
        return "";
    }
  };

  const getGoalTitle = (goalType: GoalType): string => {
    switch (goalType) {
      case "lose":
        return "Lose Weight";
      case "maintain":
        return "Maintain Weight";
      case "gain":
        return "Gain Weight";
      default:
        return "";
    }
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
    const isProteinCard = config.key === "protein";
    const isCalorieCard = config.key === "calories";

    return (
      <View style={styles.nutritionCard} key={config.key}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.nutritionHeadline}>{config.label}</Text>
            <Text style={styles.cardDescription}>
              {getCardDescription(config.key)}
            </Text>
          </View>
        </View>

        {isCalorieCard && (
          <View style={styles.proteinActions}>
            <TouchableOpacity
              style={[
                styles.calculateButton,
                { borderColor: colors.semantic.calories },
              ]}
              onPress={() => setIsCalorieCalculatorVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Open calorie calculator"
              accessibilityHint="Calculate calorie needs based on personal info and activity level"
            >
              <CalculatorIcon
                size={16}
                color={colors.primaryText}
                weight="regular"
              />
              <Text style={styles.calculateButtonText}>
                Calculate Calorie Needs
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isProteinCard && (
          <View style={styles.proteinActions}>
            <TouchableOpacity
              style={[
                styles.calculateButton,
                { borderColor: colors.semantic.protein },
              ]}
              onPress={() => setIsProteinCalculatorVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Open protein calculator"
              accessibilityHint="Calculate protein needs based on body weight and activity level"
            >
              <CalculatorIcon
                size={16}
                color={colors.primaryText}
                weight="regular"
              />
              <Text style={styles.calculateButtonText}>
                Calculate Protein Needs
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Show selected calculation method for calories */}
        {isCalorieCard && calorieCalculation && (
          <View style={styles.calculationInfo}>
            <View style={styles.calculationHeader}>
              <Text style={styles.calculationMethodTitle}>
                {getGoalTitle(calorieCalculation.goalType)}
              </Text>
              <Text style={styles.bodyWeightText}>
                {calorieCalculation.params.sex === "male" ? "Male" : "Female"},{" "}
                {calorieCalculation.params.age} years,{" "}
                {calorieCalculation.params.weight}kg,{" "}
                {calorieCalculation.params.height}cm
              </Text>
            </View>
            <Text style={styles.calculatedValue}>
              Activity Level: {calorieCalculation.method.label}
            </Text>
            <Text style={styles.calculationSubtext}>
              {calorieCalculation.method.description}
            </Text>
          </View>
        )}

        {/* Show selected calculation method for protein */}
        {isProteinCard && proteinCalculation && (
          <View style={styles.calculationInfo}>
            <View style={styles.calculationHeader}>
              <Text style={styles.calculationMethodTitle}>
                {proteinCalculation.method.title}
              </Text>
              <Text style={styles.bodyWeightText}>
                {proteinCalculation.bodyWeight}kg body weight
              </Text>
            </View>
            <Text style={styles.calculatedValue}>
              Recommended: {proteinCalculation.calculatedProtein}g daily
            </Text>
            <Text style={styles.calculationSubtext}>
              {proteinCalculation.method.description}
            </Text>
          </View>
        )}

        <View style={styles.settingsGroup}>
          <View style={styles.nutritionSettingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Daily Target</Text>
              <Text style={styles.settingSubtext}>
                Set your daily {config.label.toLowerCase()} goal
              </Text>
            </View>
            <Stepper
              value={dailyTargets[config.key]}
              min={config.min}
              max={config.max}
              step={config.step}
              onChange={(value) => handleTargetChange(config.key, value)}
              type={config.key}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderAppearanceCard = () => {
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

  if (isLoadingTargets) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["top", "left", "right"]}
      >
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.sectionSubtitle}>
            Customize the visual appearance of your app
          </Text>
          {renderAppearanceCard()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition Tracking</Text>
          <Text style={styles.sectionSubtitle}>
            Set your daily nutrition goals and manage which metrics to track
          </Text>
          {nutritionConfigs.map(renderNutritionCard)}
        </View>
      </KeyboardAwareScrollView>

      <ProteinCalculatorModal
        visible={isProteinCalculatorVisible}
        onClose={() => setIsProteinCalculatorVisible(false)}
        onSelectMethod={handleProteinCalculationSelect}
        initialBodyWeight={proteinCalculation?.bodyWeight || 70}
      />

      <CalorieCalculatorModal
        visible={isCalorieCalculatorVisible}
        onClose={() => setIsCalorieCalculatorVisible(false)}
        onSelectGoal={handleCalorieGoalSelect}
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
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    nutritionCard: {
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      ...componentStyles.cards,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: spacing.lg,
    },
    cardTitleSection: {
      flex: 1,
      marginRight: spacing.md,
    },
    cardDescription: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.secondaryText,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
    nutritionHeadline: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
    },
    proteinActions: {
      marginBottom: spacing.lg,
    },
    calculateButton: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      gap: spacing.sm,
    },
    calculateButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Body.fontWeight,
      color: colors.primaryText,
    },
    calculationInfo: {
      backgroundColor:
        scheme === "light"
          ? "rgba(255, 122, 90, 0.05)"
          : "rgba(255, 122, 90, 0.1)",
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    calculationHeader: {
      marginBottom: spacing.sm,
    },
    calculationMethodTitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    bodyWeightText: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.secondaryText,
    },
    calculatedValue: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.accent,
      marginBottom: spacing.sm,
    },
    calculationSubtext: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      lineHeight: 16,
    },
    settingsGroup: {
      backgroundColor: "transparent",
    },
    nutritionSettingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: spacing.lg,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingLabel: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: typography.Body.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    settingSubtext: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.secondaryText,
      lineHeight: 18,
    },
    settingDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: -spacing.lg,
    },
    loadingText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
    },
  });
};
