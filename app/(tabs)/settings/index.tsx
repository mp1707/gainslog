import React, { useMemo } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Button } from "@/shared/ui/atoms/Button";
import { StatusIcon } from "@/shared/ui/atoms/StatusIcon";
import { ProteinCalculatorModal } from "@/shared/ui/molecules/ProteinCalculatorModal";
import { AppearanceCard } from "@/features/settings/ui/molecules/AppearanceCard";
import { useNutritionCalculations } from "@/features/settings/hooks/useNutritionCalculations";
import { useSettingsModals } from "@/features/settings/hooks/useSettingsModals";
import { useKeyboardOffset } from "@/features/settings/hooks/useKeyboardOffset";
import {
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
} from "@/utils/nutritionCalculations";
import { StyleSheet } from "react-native";
import { Card, AppText } from "src/components";
import { SettingsSection } from "@/shared/ui/molecules/SettingsSection";
import { CaretRightIcon } from "phosphor-react-native";

export default function SettingsTab() {
  const { loadDailyTargets, isLoadingTargets } = useFoodLogStore();
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true); // true because we have a tab bar

  // Use extracted hooks
  const nutritionCalculations = useNutritionCalculations();
  const {
    dailyTargets,
    fatPercentage,
    isCaloriesSet,
    isProteinSet,
    handleTargetChange,
  } = nutritionCalculations;

  const {
    isProteinCalculatorVisible,
    setIsProteinCalculatorVisible,
    isCalorieCalculatorVisible,
    setIsCalorieCalculatorVisible,
    proteinCalculation,
    calorieCalculation,
    handleProteinCalculationSelect,
    handleCalorieGoalSelect,
    handleResetTargets,
  } = useSettingsModals(
    handleTargetChange,
    () => {}, // No need for step expansion callbacks in navigation mode
    () => {}
  );

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  const caloriesEnabled = true;
  const proteinEnabled = isCaloriesSet;
  const fatEnabled = isCaloriesSet && isProteinSet;
  const carbsEnabled = isCaloriesSet && isProteinSet;

  // Helper function to calculate values for card components
  const calculateMacroValues = () => {
    const fatGrams = calculateFatGramsFromPercentage(
      dailyTargets.calories,
      fatPercentage
    );
    const carbsGrams = calculateCarbsFromMacros(
      dailyTargets.calories,
      dailyTargets.protein,
      fatGrams
    );

    return { fatGrams, carbsGrams };
  };

  const handleNavigateToSetting = (settingName: string, enabled: boolean) => {
    if (!enabled) {
      const prerequisite = settingName === "protein" ? "calories" : "protein";
      Alert.alert(
        `${settingName.charAt(0).toUpperCase() + settingName.slice(1)} Setting`,
        `Please set your ${prerequisite} target first.`,
        [{ text: "OK" }]
      );
      return;
    }
    
    // Navigate to new calculator modal for calories, otherwise use normal navigation
    if (settingName === "calories") {
      router.push("/settings/calculator/sex");
    } else {
      router.push(`/settings/${settingName}`);
    }
  };

  if (isLoadingTargets) {
    return (
      <SafeAreaView
        style={[styles.container, styles.centered]}
        edges={["left", "right"]}
      >
        <AppText role="Body" color="secondary">
          Loading settings...
        </AppText>
      </SafeAreaView>
    );
  }

  const { fatGrams, carbsGrams } = calculateMacroValues();

  // Determine next step for guidance icon
  const nextStep = !isCaloriesSet
    ? "calories"
    : !isProteinSet
    ? "protein"
    : null;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <SafeAreaView
        style={styles.container}
        edges={["left", "right", "bottom", "top"]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SettingsSection
            title="Appearance"
            subtitle="Customize the visual appearance of your app"
          >
            <AppearanceCard />
          </SettingsSection>

          <SettingsSection
            title="Nutrition Tracking"
            subtitle="Set up your daily targets"
          >
            <Card>
              {/* Calories Setting Card */}
              <TouchableOpacity
                style={[
                  styles.settingCard,
                  { opacity: caloriesEnabled ? 1 : 0.5 },
                ]}
                onPress={() =>
                  handleNavigateToSetting("calories", caloriesEnabled)
                }
                disabled={!caloriesEnabled}
                accessibilityRole="button"
                accessibilityLabel="Calories setting"
                accessibilityHint={
                  isCaloriesSet
                    ? "Configure your daily calorie target"
                    : "Set your daily calorie target"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Calories
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {isCaloriesSet
                      ? `Target: ${dailyTargets.calories} kcal`
                      : "Set target"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  <StatusIcon
                    type={isCaloriesSet ? "completed" : "next"}
                    accessibilityLabel={
                      isCaloriesSet
                        ? "Calorie target completed"
                        : "Next step: set calories"
                    }
                  />
                  <CaretRightIcon
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Protein Setting Card */}
              <TouchableOpacity
                style={[
                  styles.settingCard,
                  styles.settingCardWithBorder,
                  { opacity: proteinEnabled ? 1 : 0.5 },
                ]}
                onPress={() =>
                  handleNavigateToSetting("protein", proteinEnabled)
                }
                disabled={!proteinEnabled}
                accessibilityRole="button"
                accessibilityLabel="Protein setting"
                accessibilityHint={
                  proteinEnabled
                    ? isProteinSet
                      ? "Configure your daily protein target"
                      : "Set your daily protein target"
                    : "Set calories first to enable protein setting"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Protein
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {proteinEnabled
                      ? isProteinSet
                        ? `Target: ${dailyTargets.protein} g`
                        : "Set target"
                      : "Set calories first"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  {isProteinSet ? (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Protein target completed"
                    />
                  ) : nextStep === "protein" ? (
                    <StatusIcon
                      type="next"
                      accessibilityLabel="Next step: set protein"
                    />
                  ) : null}
                  <CaretRightIcon
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Fat Setting Card */}
              <TouchableOpacity
                style={[
                  styles.settingCard,
                  styles.settingCardWithBorder,
                  { opacity: fatEnabled ? 1 : 0.5 },
                ]}
                onPress={() => handleNavigateToSetting("fat", fatEnabled)}
                disabled={!fatEnabled}
                accessibilityRole="button"
                accessibilityLabel="Fat setting"
                accessibilityHint={
                  fatEnabled
                    ? "Configure your daily fat target"
                    : "Set protein first to enable fat setting"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Fat
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {fatEnabled
                      ? `Target: ${Math.round(
                          fatGrams
                        )} g (${fatPercentage}% of total calories)`
                      : "Set protein first"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  {fatEnabled && (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Fat target ready"
                    />
                  )}
                  <CaretRightIcon
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Carbs Setting Card */}
              <TouchableOpacity
                style={[
                  styles.settingCard,
                  styles.settingCardWithBorder,
                  { opacity: carbsEnabled ? 1 : 0.5 },
                ]}
                onPress={() => handleNavigateToSetting("carbs", carbsEnabled)}
                disabled={!carbsEnabled}
                accessibilityRole="button"
                accessibilityLabel="Carbs setting"
                accessibilityHint={
                  carbsEnabled
                    ? "View your daily carb target"
                    : "Set protein first to enable carb setting"
                }
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={{ marginBottom: 4 }}>
                    Carbs
                  </AppText>
                  <AppText role="Caption" color="secondary">
                    {carbsEnabled
                      ? `Target: ${Math.round(carbsGrams)} g (rest of calories)`
                      : "Set protein first"}
                  </AppText>
                </View>
                <View style={styles.settingAccessory}>
                  {carbsEnabled && (
                    <StatusIcon
                      type="completed"
                      accessibilityLabel="Carb target ready"
                    />
                  )}
                  <CaretRightIcon
                    size={16}
                    color={colors.secondaryText}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
            </Card>

            <View style={styles.resetButtonContainer}>
              <Button
                onPress={handleResetTargets}
                variant="destructive"
                size="medium"
                shape="round"
                accessibilityLabel="Reset daily targets"
                accessibilityHint="Resets all nutrition targets to zero and clears saved calculations"
                style={styles.resetButton}
              >
                <AppText role="Button" color="white">
                  Reset daily targets
                </AppText>
              </Button>
            </View>
          </SettingsSection>
        </ScrollView>

        <ProteinCalculatorModal
          visible={isProteinCalculatorVisible}
          onClose={() => setIsProteinCalculatorVisible(false)}
          onSelectMethod={handleProteinCalculationSelect}
          initialBodyWeight={proteinCalculation?.bodyWeight}
        />

      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (
  colors: Colors,
  themeObj: Theme,
  bottomPadding?: number
) => {
  const { spacing } = themeObj;

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
    resetButtonContainer: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    resetButton: {
      minWidth: 200,
    },
    settingCard: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "transparent",
    },
    settingCardWithBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingAccessory: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
};
