import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TextInput,
} from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/index";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import * as Haptics from "expo-haptics";
import {
  ChevronRightIcon,
  FlameIcon,
  BeefIcon,
  WheatIcon,
  DropletIcon,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import {
  calculateFatGramsFromPercentage,
} from "@/utils/nutritionCalculations";
import { DailyTargets } from "@/types/models";

const SummaryScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safeReplace } = useNavigationGuard();

  // Onboarding store state
  const {
    calorieGoal,
    proteinGoal,
    fatPercentage,
    setFatPercentage,
    isManualMode,
    manualCalories,
    manualProtein,
    manualFat,
    setIsManualMode,
    setManualCalories,
    setManualProtein,
    setManualFat,
    reset,
  } = useOnboardingStore();

  // Main app store
  const { setDailyTargets } = useAppStore();

  // Local state for fat editing (only in calculator mode)
  const [isFatExpanded, setIsFatExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));

  // Validation errors for manual mode
  const [validationErrors, setValidationErrors] = useState({
    calories: "",
    protein: "",
    fat: "",
  });

  // Get current values based on mode
  const currentCalories = isManualMode ? (manualCalories || 0) : (calorieGoal || 0);
  const currentProtein = isManualMode ? (manualProtein || 0) : (proteinGoal || 0);
  const currentFat = isManualMode
    ? (manualFat || 0)
    : (calorieGoal ? calculateFatGramsFromPercentage(calorieGoal, fatPercentage || 30) : 0);

  // Calculate carbs (always calculated)
  const currentCarbs = useMemo(() => {
    const proteinCals = currentProtein * 4;
    const fatCals = currentFat * 9;
    const remainingCals = Math.max(0, currentCalories - proteinCals - fatCals);
    return Math.round(remainingCals / 4);
  }, [currentCalories, currentProtein, currentFat]);

  // Real-time validation function
  const validateInputs = (calories: number, protein: number, fat: number) => {
    const errors = {
      calories: "",
      protein: "",
      fat: "",
    };

    // Protein validation: (protein * 4) <= total_calories
    const proteinCalories = protein * 4;
    if (proteinCalories > calories) {
      errors.protein = "Protein calories exceed total calories";
    }

    // Fat validation: (fat * 9) <= (total_calories - (protein * 4))
    const fatCalories = fat * 9;
    const availableCaloriesForFat = calories - proteinCalories;
    if (fatCalories > availableCaloriesForFat) {
      errors.fat = "Fat calories leave no room for protein";
    }

    setValidationErrors(errors);
    return !errors.calories && !errors.protein && !errors.fat;
  };

  // Manual mode handlers
  const handleToggleManualMode = () => {
    if (!isManualMode) {
      // Switching to manual mode - initialize with current values
      setManualCalories(currentCalories);
      setManualProtein(currentProtein);
      setManualFat(currentFat);
    }
    setIsManualMode(!isManualMode);
    setValidationErrors({ calories: "", protein: "", fat: "" });
  };

  const handleManualCaloriesChange = (value: string) => {
    const calories = Number(value) || 0;
    setManualCalories(calories);
    validateInputs(calories, manualProtein || 0, manualFat || 0);
  };

  const handleManualProteinChange = (value: string) => {
    const protein = Number(value) || 0;
    setManualProtein(protein);
    validateInputs(manualCalories || 0, protein, manualFat || 0);
  };

  const handleManualFatChange = (value: string) => {
    const fat = Number(value) || 0;
    setManualFat(fat);
    validateInputs(manualCalories || 0, manualProtein || 0, fat);
  };


  const handleFatTap = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFatExpanded(!isFatExpanded);

    Animated.timing(animatedHeight, {
      toValue: isFatExpanded ? 0 : 80,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const handleFatSliderChange = (value: number) => {
    setFatPercentage(Math.round(value));
  };

  const handleConfirmAndStartTracking = async () => {
    // Validate we have all required data
    if (currentCalories <= 0 || currentProtein <= 0) {
      console.error("Missing required data for daily targets");
      return;
    }

    // In manual mode, perform final validation
    if (isManualMode) {
      const isValid = validateInputs(currentCalories, currentProtein, currentFat);
      if (!isValid) {
        console.error("Invalid manual inputs");
        return;
      }
    }

    // Create the daily targets object
    const newTargets: DailyTargets = {
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fat: currentFat,
    };

    // Save to main app store
    setDailyTargets(newTargets);

    // Clear the onboarding store
    reset();

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navigate to main dashboard
    safeReplace("/");
  };

  // Define the target rows data
  const targetRows = [
    {
      icon: FlameIcon,
      color: colors.semantic.carbs,
      label: "Calories",
      value: currentCalories,
      unit: "kcal",
      isEditable: isManualMode,
      onChange: handleManualCaloriesChange,
      error: validationErrors.calories,
    },
    {
      icon: BeefIcon,
      color: colors.semantic.protein,
      label: "Protein",
      value: currentProtein,
      unit: "g",
      isEditable: isManualMode,
      onChange: handleManualProteinChange,
      error: validationErrors.protein,
    },
    {
      icon: DropletIcon,
      color: colors.semantic.fat,
      label: "Fat",
      value: currentFat,
      unit: "g",
      percentage: !isManualMode ? `${fatPercentage}% of calories` : undefined,
      isEditable: isManualMode,
      isInteractive: !isManualMode, // Only interactive in calculator mode
      onChange: handleManualFatChange,
      error: validationErrors.fat,
    },
    {
      icon: WheatIcon,
      color: colors.accent,
      label: "Carbs",
      value: currentCarbs,
      unit: "g",
      isEditable: false, // Always calculated
      isInteractive: false,
    },
  ];

  return (
    <OnboardingScreen
      actionButton={
        <Button
          variant="primary"
          label="Confirm & Start Tracking"
          onPress={handleConfirmAndStartTracking}
          disabled={!calorieGoal || !proteinGoal}
        />
      }
    >
      {/* Title */}
      <View style={styles.titleSection}>
        <AppText role="Title2">Your Daily Blueprint</AppText>
        <AppText role="Body" color="secondary" style={styles.secondaryText}>
          Here are your starting targets. You can adjust these anytime.
        </AppText>
      </View>
        {/* Targets List */}
        <View style={styles.targetsSection}>
          {targetRows.map((target) => {
            const IconComponent = target.icon;
            const isFatRow = target.label === "Fat";
            const hasError = target.error && target.error.length > 0;

            return (
              <View key={target.label} style={styles.targetRowContainer}>
                <TouchableOpacity
                  style={[
                    styles.targetRow,
                    isFatRow && isFatExpanded && !isManualMode && styles.targetRowExpanded,
                    hasError && styles.targetRowError
                  ]}
                  onPress={target.isInteractive ? handleFatTap : undefined}
                  disabled={!target.isInteractive}
                  activeOpacity={target.isInteractive ? 0.7 : 1}
                >
                  <View style={styles.targetRowContent}>
                    <View style={styles.targetLeft}>
                      <IconComponent
                        size={24}
                        color={target.color}
                        strokeWidth={2}
                      />
                      <AppText role="Body">{target.label}</AppText>
                    </View>

                    <View style={styles.targetRight}>
                      {target.isEditable ? (
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={[
                              styles.targetInput,
                              hasError && styles.targetInputError
                            ]}
                            value={target.value?.toString() || ""}
                            onChangeText={target.onChange}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.secondaryText}
                          />
                          <AppText role="Body" color="secondary">{target.unit}</AppText>
                        </View>
                      ) : (
                        <View style={styles.targetValueContainer}>
                          <AppText role="Headline">
                            {target.value} {target.unit}
                          </AppText>
                          {target.percentage && (
                            <AppText role="Caption" color="secondary">
                              ({target.percentage})
                            </AppText>
                          )}
                        </View>
                      )}
                      {target.isInteractive && (
                        <ChevronRightIcon
                          size={20}
                          color={colors.secondaryText}
                          style={[
                            styles.chevron,
                            isFatExpanded && styles.chevronRotated
                          ]}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Error Message */}
                {hasError && (
                  <View style={styles.errorContainer}>
                    <AppText role="Caption" style={{ color: colors.error }}>{target.error}</AppText>
                  </View>
                )}

                {/* Fat Slider - Only for fat row in calculator mode */}
                {isFatRow && !isManualMode && (
                  <Animated.View
                    style={[
                      styles.sliderContainer,
                      { height: animatedHeight }
                    ]}
                  >
                    <View style={styles.sliderContent}>
                      <View style={styles.sliderLabels}>
                        <AppText role="Caption" color="secondary">20%</AppText>
                        <AppText role="Body">
                          {fatPercentage}% of calories
                        </AppText>
                        <AppText role="Caption" color="secondary">45%</AppText>
                      </View>
                      <Slider
                        style={styles.slider}
                        minimumValue={20}
                        maximumValue={45}
                        value={fatPercentage || 30}
                        onValueChange={handleFatSliderChange}
                        minimumTrackTintColor={colors.semantic.fat}
                        maximumTrackTintColor={colors.secondaryBackground}
                        thumbTintColor={colors.semantic.fat}
                        step={1}
                      />
                    </View>
                  </Animated.View>
                )}
              </View>
            );
          })}
        </View>

        {/* Manual Override Toggle */}
        <View style={styles.toggleSection}>
          <Button
            variant="tertiary"
            label={isManualMode ? "Use Calculator" : "Customize"}
            onPress={handleToggleManualMode}
          />
        </View>

        {/* Informational Footer */}
        <View style={styles.infoSection}>
          <AppText
            role="Caption"
            color="secondary"
            style={[styles.secondaryText, { lineHeight: 18 }]}
          >
            Tip: Fat is defaulted to 30% and can be adjusted. Carbs are calculated from the remainder.
          </AppText>
        </View>

    </OnboardingScreen>
  );
};

export default SummaryScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing } = theme;

  return StyleSheet.create({
    titleSection: {
      alignItems: "center",
      marginBottom: spacing.xl,
      gap: spacing.xs,
    },
    secondaryText: {
      textAlign: "center",
      maxWidth: "75%",
      alignSelf: "center",
    },
    targetsSection: {
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    targetRowContainer: {
      overflow: "hidden",
    },
    targetRow: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: 12,
      padding: spacing.md,
      minHeight: 60,
    },
    targetRowExpanded: {
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    targetRowContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      flex: 1,
    },
    targetLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    targetRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    targetValueContainer: {
      alignItems: "flex-end",
    },
    chevron: {
      transform: [{ rotate: "0deg" }],
    },
    chevronRotated: {
      transform: [{ rotate: "90deg" }],
    },
    sliderContainer: {
      backgroundColor: colors.secondaryBackground,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
      overflow: "hidden",
    },
    sliderContent: {
      padding: spacing.md,
      paddingTop: 0,
    },
    sliderLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    slider: {
      height: 30,
    },
    infoSection: {
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.xl,
    },
    targetRowError: {
      borderColor: colors.error,
      borderWidth: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    targetInput: {
      minWidth: 60,
      textAlign: "right",
      backgroundColor: "transparent",
      color: colors.primaryText,
    },
    targetInputError: {
      color: colors.error,
    },
    toggleSection: {
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    errorContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
    },
  });
};
