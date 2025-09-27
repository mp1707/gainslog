import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  View,
  StyleSheet,
  Animated,
  Pressable,
  TextInput as RNTextInput,
  ViewStyle,
} from "react-native";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useOnboardingStore } from "@/store/useOnboardingStore";
import { useAppStore } from "@/store/useAppStore";
import { Button, Card } from "@/components/index";
import { RoundButton } from "@/components/shared/RoundButton";
import { OnboardingScreen } from "./_components/OnboardingScreen";
import * as Haptics from "expo-haptics";
import {
  ChevronRightIcon,
  Flame,
  BicepsFlexed,
  Wheat,
  Droplet,
  Pencil,
} from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { TextInput } from "@/components/shared/TextInput/TextInput";
import { calculateFatGramsFromPercentage } from "@/utils/nutritionCalculations";
import { DailyTargets } from "@/types/models";

type EditableField = "calories" | "protein" | "fat";

const SummaryScreen = () => {
  const { colors, theme: themeObj } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { safeReplace } = useNavigationGuard();

  // Onboarding store state
  const {
    calorieGoal,
    proteinGoal,
    fatPercentage,
    setCalorieGoal,
    setProteinGoal,
    setFatPercentage,
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

  const [isEditing, setIsEditing] = useState(false);
  const [activeField, setActiveField] = useState<EditableField | null>(null);
  const [draftValues, setDraftValues] = useState({
    calories: 0,
    protein: 0,
    fat: 0,
  });

  const caloriesInputRef = useRef<RNTextInput | null>(null);
  const proteinInputRef = useRef<RNTextInput | null>(null);
  const fatInputRef = useRef<RNTextInput | null>(null);

  // Get stored values based on mode
  const effectiveFatPercentage = fatPercentage ?? 30;
  const baseCalories = calorieGoal || 0;
  const baseProtein = proteinGoal || 0;
  const baseFat = calorieGoal
    ? calculateFatGramsFromPercentage(calorieGoal, effectiveFatPercentage)
    : 0;

  const baseValues = useMemo(
    () => ({
      calories: baseCalories,
      protein: baseProtein,
      fat: baseFat,
    }),
    [baseCalories, baseProtein, baseFat]
  );

  useEffect(() => {
    if (!isEditing) {
      setDraftValues(baseValues);
      setValidationErrors({ calories: "", protein: "", fat: "" });
      setActiveField(null);
    }
  }, [baseValues, isEditing]);

  // Calculate carbs using the currently displayed values
  const {
    calories: displayCalories,
    protein: displayProtein,
    fat: displayFat,
  } = isEditing ? draftValues : baseValues;

  const currentCarbs = useMemo(() => {
    const proteinCals = displayProtein * 4;
    const fatCals = displayFat * 9;
    const remainingCals = Math.max(0, displayCalories - proteinCals - fatCals);
    return Math.round(remainingCals / 4);
  }, [displayCalories, displayProtein, displayFat]);

  // Real-time validation function
  const validateInputs = useCallback(
    (calories: number, protein: number, fat: number) => {
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
        errors.fat = "Carbs cannot be negative.";
      }

      const isValid = !errors.calories && !errors.protein && !errors.fat;
      setValidationErrors(errors);

      return { isValid, errors };
    },
    []
  );

  const handleStartEditing = () => {
    setDraftValues(baseValues);
    setValidationErrors({ calories: "", protein: "", fat: "" });
    setActiveField(null);
    setIsFatExpanded(false);
    animatedHeight.setValue(0);
    setIsEditing(true);
  };

  const handleDraftValueChange = (field: EditableField, value: string) => {
    const numeric = Number(value) || 0;

    setDraftValues((prev) => {
      const updated = { ...prev, [field]: numeric } as typeof prev;
      validateInputs(updated.calories, updated.protein, updated.fat);
      return updated;
    });
  };

  const focusField = (field: EditableField) => {
    const inputMap: Record<
      EditableField,
      React.RefObject<RNTextInput | null>
    > = {
      calories: caloriesInputRef,
      protein: proteinInputRef,
      fat: fatInputRef,
    };

    requestAnimationFrame(() => {
      inputMap[field].current?.focus();
    });
  };

  const handleFieldPress = (field: EditableField) => {
    setActiveField(field);
    focusField(field);
  };

  const handleSaveChanges = () => {
    const { isValid, errors } = validateInputs(
      draftValues.calories,
      draftValues.protein,
      draftValues.fat
    );

    if (!isValid) {
      const errorField = (Object.keys(errors) as EditableField[]).find(
        (key) => errors[key]
      );
      if (errorField) {
        setActiveField(errorField);
        focusField(errorField);
      }
      return;
    }

    const newCalorieGoal = draftValues.calories;
    const newProteinGoal = draftValues.protein;
    const newFatGoal = draftValues.fat;
    const fatPercentageFromGrams =
      newCalorieGoal > 0 ? (newFatGoal * 9 * 100) / newCalorieGoal : undefined;
    const hasValidFatPercentage =
      typeof fatPercentageFromGrams === "number" &&
      Number.isFinite(fatPercentageFromGrams);
    const newFatPercentage = hasValidFatPercentage
      ? Math.max(0, Math.min(100, Math.round(fatPercentageFromGrams)))
      : effectiveFatPercentage;

    setCalorieGoal(newCalorieGoal);
    setProteinGoal(newProteinGoal);
    setFatPercentage(newFatPercentage);
    setIsEditing(false);
  };

  const currentCalories = baseValues.calories;
  const currentProtein = baseValues.protein;
  const currentFat = baseValues.fat;

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
      key: "calories" as const,
      icon: Flame,
      color: colors.semantic.calories,
      backgroundColor: colors.semanticSurfaces.calories,
      label: "Calories",
      value: displayCalories,
      unit: "kcal",
      editable: true,
      error: validationErrors.calories,
      inputRef: caloriesInputRef,
    },
    {
      key: "protein" as const,
      icon: BicepsFlexed,
      color: colors.semantic.protein,
      backgroundColor: colors.semanticSurfaces.protein,
      label: "Protein",
      value: displayProtein,
      unit: "g",
      editable: true,
      error: validationErrors.protein,
      inputRef: proteinInputRef,
    },
    {
      key: "fat" as const,
      icon: Droplet,
      color: colors.semantic.fat,
      backgroundColor: colors.semanticSurfaces.fat,
      label: "Fat",
      value: displayFat,
      unit: "g",
      percentage: !isEditing
        ? `${effectiveFatPercentage}% of calories`
        : undefined,
      editable: true,
      error: validationErrors.fat,
      inputRef: fatInputRef,
    },
    {
      key: "carbs",
      icon: Wheat,
      color: colors.semantic.carbs,
      backgroundColor: colors.semanticSurfaces.carbs,
      label: "Carbs",
      value: currentCarbs,
      unit: "g",
      editable: false,
    },
  ];

  return (
    <OnboardingScreen
      actionButton={
        <View style={styles.actionButtonsContainer}>
          {!isEditing && (
            <View style={styles.secondaryActions}>
              <Pressable onPress={handleStartEditing}>
                <AppText
                  role="Button"
                  color="accent"
                  style={styles.centeredText}
                >
                  Adjust Targets
                </AppText>
              </Pressable>
            </View>
          )}
          <Button
            variant="primary"
            label={isEditing ? "Save Changes" : "Confirm & Start Tracking"}
            onPress={
              isEditing ? handleSaveChanges : handleConfirmAndStartTracking
            }
            disabled={
              !isEditing && (currentCalories <= 0 || currentProtein <= 0)
            }
          />
        </View>
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
          const isFatRow = target.key === "fat";
          const hasError = Boolean(target.error);
          const showFatSlider = isFatRow && !isEditing;
          const isEditableField = target.editable && target.key !== "carbs";
          const editableKey = isEditableField
            ? (target.key as EditableField)
            : null;
          const isActiveField = editableKey
            ? activeField === editableKey
            : false;
          const cardStyleOverride = StyleSheet.flatten([
            styles.cardOverrides,
            isFatRow && isFatExpanded && showFatSlider
              ? styles.targetRowExpanded
              : undefined,
            hasError ? styles.targetRowError : undefined,
          ]) as ViewStyle;

          return (
            <View key={target.key}>
              <Pressable
                onPress={showFatSlider ? handleFatTap : undefined}
                disabled={!showFatSlider}
              >
                <Card padding={themeObj.spacing.md} style={cardStyleOverride}>
                  <View style={styles.targetRowContent}>
                    <View style={styles.targetLeft}>
                      <View
                        style={[
                          styles.targetIconBackground,
                          { backgroundColor: target.backgroundColor },
                        ]}
                      >
                        <IconComponent
                          size={20}
                          color={target.color}
                          fill={target.color}
                          strokeWidth={0}
                        />
                      </View>
                      <AppText role="Body">{target.label}</AppText>
                    </View>

                    <View style={styles.targetRight}>
                      {isEditableField && isActiveField && editableKey ? (
                        <View style={styles.inputContainer}>
                          <TextInput
                            ref={target.inputRef}
                            keyboardType="numeric"
                            returnKeyType="done"
                            value={target.value?.toString() || ""}
                            onChangeText={(text) =>
                              handleDraftValueChange(editableKey, text)
                            }
                            fontSize="Headline"
                            containerStyle={styles.inlineInputContainer}
                            style={styles.inlineInput}
                          />
                          <AppText role="Body" color="secondary">
                            {target.unit}
                          </AppText>
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

                      {showFatSlider && (
                        <ChevronRightIcon
                          size={20}
                          color={colors.secondaryText}
                          style={[
                            styles.chevron,
                            isFatExpanded ? styles.chevronRotated : undefined,
                          ]}
                        />
                      )}

                      {isEditableField && editableKey && isEditing && (
                        <RoundButton
                          Icon={Pencil}
                          variant="tertiary"
                          iconSize={16}
                          iconStrokeWidth={1.5}
                          iconColor={colors.accent}
                          backgroundColor={colors.semanticSurfaces.calories}
                          onPress={() => handleFieldPress(editableKey)}
                          accessibilityLabel={`Edit ${target.label}`}
                          style={styles.editButton}
                          hitSlop={themeObj.spacing.xs}
                        />
                      )}
                    </View>
                  </View>
                </Card>
              </Pressable>

              {hasError && (
                <View style={styles.errorContainer}>
                  <AppText role="Caption" style={{ color: colors.error }}>
                    {target.error}
                  </AppText>
                </View>
              )}

              {isFatRow && showFatSlider && (
                <Animated.View
                  style={[styles.sliderContainer, { height: animatedHeight }]}
                >
                  <View style={styles.sliderContent}>
                    <View style={styles.sliderLabels}>
                      <AppText role="Caption" color="secondary">
                        20%
                      </AppText>
                      <AppText role="Body">
                        {effectiveFatPercentage}% of calories
                      </AppText>
                      <AppText role="Caption" color="secondary">
                        45%
                      </AppText>
                    </View>
                    <Slider
                      style={styles.slider}
                      minimumValue={20}
                      maximumValue={45}
                      value={effectiveFatPercentage}
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

      {/* Informational Footer */}
      <View style={styles.infoSection}>
        <AppText
          role="Caption"
          color="secondary"
          style={[
            styles.secondaryText,
            { lineHeight: 18, textAlign: "center" },
          ]}
        >
          Tip: Fat is defaulted to 30% and can be adjusted. Carbs are calculated
          from the remainder.
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
      // overflow: "hidden",
    },
    cardOverrides: {
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
      minWidth: 88,
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
    inlineInputContainer: {
      width: 112,
      alignSelf: "flex-end",
    },
    inlineInput: {
      textAlign: "right",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    actionButtonsContainer: {
      gap: spacing.md,
      alignItems: "stretch",
    },
    secondaryActions: {
      gap: spacing.xs,
      alignItems: "center",
    },
    centeredText: {
      textAlign: "center",
    },
    errorContainer: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
    },
    targetIconBackground: {
      borderRadius: 100,
      padding: spacing.sm,
    },
    editButton: {
      marginLeft: spacing.sm,
    },
  });
};
