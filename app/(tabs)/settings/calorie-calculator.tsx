import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CaretLeftIcon,
  CaretRightIcon,
  GenderMaleIcon,
  GenderFemaleIcon,
} from "phosphor-react-native";
import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { Stepper } from "@/shared/ui/atoms/Stepper/Stepper";
import { Toggle, type ToggleOption } from "@/shared/ui/atoms/Toggle";
import {
  CalorieCalculationCard,
  CALCULATION_METHODS,
} from "@/shared/ui/atoms/CalorieCalculationCard";
import { GoalSelectionCard } from "@/shared/ui/atoms/GoalSelectionCard";
import { calculateCalorieGoals } from "@/utils/calculateCalories";
import type {
  CalorieCalculationMethod,
  GoalType,
  CalorieIntakeParams,
  ActivityLevel,
  Sex,
} from "@/types";
import {
  getCalorieCalculatorParams,
  saveCalorieCalculatorParams,
} from "@/lib/storage";
import { StyleSheet } from "react-native";

export default function CalorieCalculatorScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { updateDailyTargets, setCalorieCalculation, dailyTargets } = useFoodLogStore();

  // Create a stable initial params object to prevent re-renders
  const stableInitialParams = useMemo(
    () => ({
      sex: "male" as Sex,
      age: 30,
      weight: 85,
      height: 175,
    }),
    []
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [params, setParams] =
    useState<CalorieIntakeParams>(stableInitialParams);
  const [selectedActivityLevel, setSelectedActivityLevel] =
    useState<ActivityLevel | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Load saved params when screen opens
  useEffect(() => {
    const loadSavedParams = async () => {
      try {
        const savedParams = await getCalorieCalculatorParams();
        setParams(savedParams);
        setIsParamsLoaded(true);
      } catch (error) {
        console.error("Failed to load saved params:", error);
        setParams(stableInitialParams);
        setIsParamsLoaded(true);
      }
    };

    loadSavedParams();
  }, [stableInitialParams]);

  // Save params to storage whenever they change
  useEffect(() => {
    const saveParams = async () => {
      if (isParamsLoaded) {
        try {
          await saveCalorieCalculatorParams(params);
        } catch (error) {
          console.error("Failed to save params:", error);
        }
      }
    };

    saveParams();
  }, [params, isParamsLoaded]);

  const handleActivityLevelSelect = (method: CalorieCalculationMethod) => {
    setSelectedActivityLevel(method.id);
  };

  const handleGoalSelect = async (goalType: GoalType) => {
    if (!selectedActivityLevel) return;

    const calorieGoals = calculateCalorieGoals(params, selectedActivityLevel);
    const calories =
      calorieGoals[
        goalType === "lose"
          ? "loseWeight"
          : goalType === "maintain"
          ? "maintainWeight"
          : "gainWeight"
      ];

    // Update the daily targets
    const newTargets = { ...dailyTargets, calories };
    await updateDailyTargets(newTargets);

    // Save the calculation for display on settings screen
    const selectedMethod = CALCULATION_METHODS[selectedActivityLevel];
    setCalorieCalculation(selectedMethod, params, selectedActivityLevel, calories, goalType);

    // Navigate back to calories settings
    router.back();
  };

  const handleNextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0:
        return true; // Always can proceed from personal info
      case 1:
        return selectedActivityLevel !== null;
      default:
        return false;
    }
  };

  const updateParam = <K extends keyof CalorieIntakeParams>(
    key: K,
    value: CalorieIntakeParams[K]
  ) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  // Sex toggle options
  const sexToggleOptions: [ToggleOption<Sex>, ToggleOption<Sex>] = [
    {
      value: "male",
      label: "Male",
      icon: GenderMaleIcon,
    },
    {
      value: "female",
      label: "Female",
      icon: GenderFemaleIcon,
    },
  ];

  const methods = Object.values(CALCULATION_METHODS);

  // Calculate calorie goals for selected activity level
  const selectedCalorieGoals = selectedActivityLevel
    ? calculateCalorieGoals(params, selectedActivityLevel)
    : null;

  const getStepTitle = () => {
    switch (currentStep) {
      case 0:
        return "Personal Information";
      case 1:
        return "Activity Level";
      case 2:
        return "Choose Your Goal";
      default:
        return "Calorie Calculator";
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={73}
    >
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={currentStep > 0 ? handlePrevStep : handleClose}
            accessibilityRole="button"
            accessibilityLabel={currentStep > 0 ? "Go back" : "Cancel"}
            hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
          >
            {currentStep > 0 ? (
              <CaretLeftIcon size={24} color={styles.cancelButton.color} />
            ) : (
              <Text style={styles.cancelButton}>Cancel</Text>
            )}
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{getStepTitle()}</Text>
            <Text style={styles.stepIndicator}>
              Step {currentStep + 1} of 3
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step 0: Personal Info Input */}
          {currentStep === 0 && (
            <View>
              <View style={styles.methodsSection}>
                <Text style={styles.sectionSubtitle}>
                  Enter your details to calculate your daily calorie needs.
                </Text>
              </View>

              {/* Sex Selection Card */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Biological Sex</Text>
                <Toggle
                  value={params.sex}
                  options={sexToggleOptions}
                  onChange={(value) => updateParam("sex", value)}
                  accessibilityLabel="Select biological sex"
                />
              </View>

              {/* Age Input Card */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Age (years)</Text>
                <View style={styles.stepperContainer}>
                  <Stepper
                    value={params.age}
                    min={13}
                    max={120}
                    step={1}
                    onChange={(value) => updateParam("age", value)}
                  />
                </View>
              </View>

              {/* Weight Input Card */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Weight (kg)</Text>
                <View style={styles.stepperContainer}>
                  <Stepper
                    value={params.weight}
                    min={30}
                    max={300}
                    step={1}
                    onChange={(value) => updateParam("weight", value)}
                  />
                </View>
                <Text style={styles.inputHint}>
                  {params.weight}kg = {Math.round(params.weight * 2.205)}lbs
                </Text>
              </View>

              {/* Height Input Card */}
              <View style={styles.inputCard}>
                <Text style={styles.sectionTitle}>Height (cm)</Text>
                <View style={styles.stepperContainer}>
                  <Stepper
                    value={params.height}
                    min={100}
                    max={250}
                    step={1}
                    onChange={(value) => updateParam("height", value)}
                  />
                </View>
                <Text style={styles.inputHint}>
                  {params.height}cm = {Math.floor(params.height / 30.48)}'
                  {Math.round((params.height % 30.48) / 2.54)}"
                </Text>
              </View>
            </View>
          )}

          {/* Step 1: Activity Level Selection */}
          {currentStep === 1 && (
            <View style={styles.methodsSection}>
              <Text style={styles.sectionSubtitle}>
                Select the option that best matches your lifestyle and
                exercise routine.
              </Text>

              {methods.map((method) => (
                <CalorieCalculationCard
                  key={method.id}
                  method={method}
                  isSelected={selectedActivityLevel === method.id}
                  onSelect={handleActivityLevelSelect}
                  showCalorieGoals={false}
                />
              ))}
            </View>
          )}

          {/* Step 2: Goal Selection */}
          {currentStep === 2 && selectedCalorieGoals && (
            <View style={styles.methodsSection}>
              <Text style={styles.sectionSubtitle}>
                Choose your calorie goal based on what you want to achieve.
              </Text>

              <GoalSelectionCard
                goalType="lose"
                calories={selectedCalorieGoals.loseWeight}
                isSelected={selectedGoal === "lose"}
                onSelect={handleGoalSelect}
              />

              <GoalSelectionCard
                goalType="maintain"
                calories={selectedCalorieGoals.maintainWeight}
                isSelected={selectedGoal === "maintain"}
                onSelect={handleGoalSelect}
              />

              <GoalSelectionCard
                goalType="gain"
                calories={selectedCalorieGoals.gainWeight}
                isSelected={selectedGoal === "gain"}
                onSelect={handleGoalSelect}
              />
            </View>
          )}

          {/* Navigation Button */}
          {currentStep < 2 && (
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  !canProceedToNextStep() && styles.continueButtonDisabled,
                ]}
                onPress={handleNextStep}
                disabled={!canProceedToNextStep()}
              >
                <Text
                  style={[
                    styles.continueButtonText,
                    !canProceedToNextStep() &&
                      styles.continueButtonTextDisabled,
                  ]}
                >
                  Continue
                </Text>
                <CaretRightIcon
                  size={20}
                  color={canProceedToNextStep() ? "#FFFFFF" : "#999999"}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Footer Note */}
          <View style={styles.footer}>
            <Text style={styles.footerNote}>
              These recommendations are general guidelines based on the
              Mifflin-St Jeor equation. Consult with a nutritionist or
              healthcare provider for personalized advice.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    cancelButton: {
      color: colors.accent,
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center",
    },
    title: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    stepIndicator: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      marginTop: 2,
    },
    headerSpacer: {
      width: 60, // Same width as cancel button area
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.lg,
    },
    methodsSection: {
      marginBottom: spacing.lg,
    },
    sectionSubtitle: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    inputCard: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: themeObj.components.cards.cornerRadius,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      marginBottom: spacing.md,
    },
    stepperContainer: {
      alignItems: "center",
    },
    inputHint: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      marginTop: spacing.sm,
    },
    navigationContainer: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: themeObj.components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    continueButtonDisabled: {
      backgroundColor: colors.disabledBackground,
    },
    continueButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: "#FFFFFF",
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    continueButtonTextDisabled: {
      color: colors.disabledText,
    },
    footer: {
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerNote: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 18,
    },
  });
};