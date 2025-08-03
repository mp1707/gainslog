import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  CalculatorIcon,
  ArrowDownIcon,
  CheckCircleIcon,
} from "phosphor-react-native";
import { useTheme } from "../../src/providers/ThemeProvider";
import { useFoodLogStore } from "../../src/stores/useFoodLogStore";
import { Stepper } from "../../src/shared/ui/atoms/Stepper";
import { NutritionSlider } from "../../src/shared/ui/atoms/NutritionSlider/NutritionSlider";
import { ProteinCalculatorModal } from "../../src/shared/ui/molecules/ProteinCalculatorModal";
import { ProteinCalculationMethod } from "../../src/shared/ui/atoms/ProteinCalculationCard";
import { CalorieCalculatorModal } from "../../src/shared/ui/molecules/CalorieCalculatorModal";
import { CALCULATION_METHODS } from "../../src/shared/ui/atoms/CalorieCalculationCard";
import { GoalType } from "../../src/shared/ui/atoms/GoalSelectionCard";
import { Button } from "../../src/shared/ui/atoms/Button";
import {
  CalorieIntakeParams,
  ActivityLevel,
} from "../../src/utils/calculateCalories";
import {
  calculateMacrosFromProtein,
  calculateFatGramsFromPercentage,
  calculateCarbsFromMacros,
  calculateMaxFatPercentage,
} from "../../src/utils/nutritionCalculations";

// Step Header Component
const StepHeader: React.FC<{
  stepNumber: number;
  title: string;
  description: string;
  helpText: string;
  completed: boolean;
  colors: any;
  styles: any;
}> = ({
  stepNumber,
  title,
  description,
  helpText,
  completed,
  colors,
  styles,
}) => {
  return (
    <View
      style={styles.stepHeader}
      accessibilityLabel={`${title}. ${
        completed ? "Completed" : "In progress"
      }`}
      accessibilityHint={description}
    >
      <View style={styles.stepTitleRow}>
        <View
          style={styles.stepNumberContainer}
          accessibilityRole="image"
          accessibilityLabel={
            completed ? `Step ${stepNumber} completed` : `Step ${stepNumber}`
          }
        >
          {completed ? (
            <CheckCircleIcon
              size={24}
              color={colors.semantic.calories}
              weight="fill"
            />
          ) : (
            <View
              style={[styles.stepNumber, { backgroundColor: colors.accent }]}
            >
              <Text style={[styles.stepNumberText, { color: colors.white }]}>
                {stepNumber}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.stepTitleContent}>
          <Text style={styles.stepTitle} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.stepDescription}>{description}</Text>
        </View>
      </View>
      <View style={styles.stepHelpContainer}>
        <Text
          style={styles.stepHelpText}
          accessibilityRole="text"
          accessibilityHint="Helpful tip for this step"
        >
          {helpText}
        </Text>
      </View>
    </View>
  );
};

// Flow Arrow Component
const FlowArrow: React.FC<{
  visible: boolean;
  colors: any;
  styles: any;
}> = ({ visible, colors, styles }) => {
  if (!visible) return null;

  return (
    <View
      style={styles.flowArrowContainer}
      accessibilityRole="image"
      accessibilityLabel="Step completed, proceed to next step"
      accessibilityHint="Visual indicator showing flow to next step"
    >
      <ArrowDownIcon
        size={20}
        color={colors.semantic.calories}
        weight="regular"
      />
    </View>
  );
};

// Animated Calculator Button Component
const AnimatedCalculatorButton: React.FC<{
  isCalorieCard: boolean;
  onPress: () => void;
  colors: any;
}> = ({ isCalorieCard, onPress, colors }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    rotation.value = withTiming(-5, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    rotation.value = withTiming(0, { duration: 100 });
  };

  const handlePress = () => {
    rotation.value = withTiming(15, { duration: 100 }, () => {
      rotation.value = withTiming(0, { duration: 100 });
    });
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          {
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            shadowColor: colors.primaryText,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          },
          {
            backgroundColor: isCalorieCard
              ? colors.semantic.calories + "15"
              : colors.semantic.protein + "15",
            borderColor: isCalorieCard
              ? colors.semantic.calories
              : colors.semantic.protein,
          },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`Open ${
          isCalorieCard ? "calorie" : "protein"
        } calculator`}
        accessibilityHint={`Calculate ${
          isCalorieCard ? "calorie" : "protein"
        } needs based on personal info`}
      >
        <CalculatorIcon
          size={18}
          color={
            isCalorieCard ? colors.semantic.calories : colors.semantic.protein
          }
          weight="regular"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    resetDailyTargets,
  } = useFoodLogStore();

  const [isProteinCalculatorVisible, setIsProteinCalculatorVisible] =
    useState(false);
  const [isCalorieCalculatorVisible, setIsCalorieCalculatorVisible] =
    useState(false);

  // Fat percentage state for new flow
  const [fatPercentage, setFatPercentage] = useState(30);

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

  // Flow state logic
  const isCaloriesSet = dailyTargets.calories > 0;
  const isProteinSet = dailyTargets.protein > 0;

  // Determine field enablement based on flow state
  const isCaloriesFieldEnabled = true; // Always enabled
  const isProteinFieldEnabled = isCaloriesSet;

  // Determine instructional text
  const getStepInfo = () => {
    return {
      step1: {
        completed: isCaloriesSet,
        title: "Step 1: Set Your Daily Calories",
        description: "Your total energy intake target for the day",
        helpText:
          "This forms the foundation for all other nutritional calculations",
      },
      step2: {
        completed: isProteinSet,
        title: "Step 2: Set Your Protein Target",
        description: "Essential macronutrient for muscle growth and recovery",
        helpText: "Protein needs are based on body weight and activity level",
      },
      step3: {
        completed: isCaloriesSet && isProteinSet,
        title: "Step 3: Distribute Remaining Calories",
        description: "Balance fat and carbohydrates for optimal nutrition",
        helpText:
          "For advanced strength athletes, 25-35% of total calories from fat is recommended",
      },
    };
  };

  const stepInfo = getStepInfo();

  const handleTargetChange = (
    key: keyof typeof dailyTargets,
    value: number
  ) => {
    const currentTargets = dailyTargets;

    let newTargets = {
      ...currentTargets,
      [key]: value,
    };

    // Check if this is the first time protein is being set (during guided flow)
    const isFirstTimeSettingProtein =
      key === "protein" && !isProteinSet && isCaloriesSet && value > 0;

    if (isFirstTimeSettingProtein) {
      // Auto-calculate Fat and Carbs when protein is first set
      const calculated = calculateMacrosFromProtein(
        currentTargets.calories,
        value
      );
      setFatPercentage(calculated.fatPercentage);
      newTargets = {
        ...newTargets,
        fat: calculated.fat,
        carbs: calculated.carbs,
      };
    } else if (key === "calories" && isProteinSet) {
      // Calories changed: recalculate fat and carbs based on current percentage
      const newFatGrams = calculateFatGramsFromPercentage(value, fatPercentage);
      const newCarbsGrams = calculateCarbsFromMacros(
        value,
        currentTargets.protein,
        newFatGrams
      );
      newTargets = {
        ...newTargets,
        fat: newFatGrams,
        carbs: newCarbsGrams,
      };
    } else if (key === "protein" && isProteinSet) {
      // Protein changed: recalculate carbs (fat percentage stays same)
      const fatGrams = calculateFatGramsFromPercentage(
        currentTargets.calories,
        fatPercentage
      );
      const newCarbsGrams = calculateCarbsFromMacros(
        currentTargets.calories,
        value,
        fatGrams
      );
      newTargets = {
        ...newTargets,
        carbs: newCarbsGrams,
      };
    }

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

  const handleResetTargets = () => {
    Alert.alert(
      "Reset Daily Targets",
      "This will reset all your daily nutrition targets to zero and clear any saved calculations. This action cannot be undone.\n\nAre you sure you want to continue?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await resetDailyTargets();
              Alert.alert(
                "Success",
                "Daily targets have been reset successfully."
              );
            } catch (error) {
              // Error is already handled in the store
            }
          },
        },
      ]
    );
  };

  const getCardDescription = (key: keyof typeof dailyTargets): string => {
    switch (key) {
      case "calories":
        return "Energy from food to fuel your daily activities";
      case "protein":
        return "Essential for muscle growth and recovery";
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
  ];

  const renderNutritionCard = (config: (typeof nutritionConfigs)[number]) => {
    const isProteinCard = config.key === "protein";
    const isCalorieCard = config.key === "calories";

    // Determine if this field should be disabled
    const isFieldDisabled =
      (isCalorieCard && !isCaloriesFieldEnabled) ||
      (isProteinCard && !isProteinFieldEnabled);

    return (
      <View style={styles.nutritionCard} key={config.key}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.nutritionHeadline}>{config.label}</Text>
            <Text style={styles.cardDescription}>
              {getCardDescription(config.key)}
            </Text>
          </View>
          {(isCalorieCard || isProteinCard) && !isFieldDisabled && (
            <AnimatedCalculatorButton
              isCalorieCard={isCalorieCard}
              onPress={() =>
                isCalorieCard
                  ? setIsCalorieCalculatorVisible(true)
                  : setIsProteinCalculatorVisible(true)
              }
              colors={colors}
            />
          )}
        </View>

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
          <View style={styles.calculationInfoProtein}>
            <View style={styles.calculationHeader}>
              <Text style={styles.calculationMethodTitle}>
                {proteinCalculation.method.title}
              </Text>
              <Text style={styles.bodyWeightText}>
                {proteinCalculation.bodyWeight}kg body weight
              </Text>
            </View>
            <Text style={styles.calculatedValueProtein}>
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
              disabled={isFieldDisabled}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderMacroDistributionCard = () => {
    if (!isCaloriesSet || !isProteinSet) return null;

    const proteinCalories = dailyTargets.protein * 4;
    const remainingCalories = dailyTargets.calories - proteinCalories;
    const fatGrams = calculateFatGramsFromPercentage(
      dailyTargets.calories,
      fatPercentage
    );
    const carbsGrams = calculateCarbsFromMacros(
      dailyTargets.calories,
      dailyTargets.protein,
      fatGrams
    );
    const fatCalories = fatGrams * 9;
    const carbCalories = carbsGrams * 4;

    return (
      <View style={styles.nutritionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.nutritionHeadline}>
              Remaining Calorie Distribution
            </Text>
            <Text style={styles.cardDescription}>
              After protein ({dailyTargets.protein}g = {proteinCalories}{" "}
              calories), you have {remainingCalories} calories left to
              distribute
            </Text>
          </View>
        </View>

        <View style={styles.macroDistributionInfo}>
          <View style={styles.macroBreakdownRow}>
            <View
              style={[
                styles.macroColorIndicator,
                { backgroundColor: colors.semantic.fat },
              ]}
            />
            <Text style={styles.macroDistributionText}>
              Fat: {fatPercentage}% ({fatGrams}g = {fatCalories} cal)
            </Text>
          </View>
          <View style={styles.macroBreakdownRow}>
            <View
              style={[
                styles.macroColorIndicator,
                { backgroundColor: colors.semantic.carbs },
              ]}
            />
            <Text style={styles.macroDistributionText}>
              Carbs: {Math.round((carbCalories / dailyTargets.calories) * 100)}%
              ({carbsGrams}g = {carbCalories} cal)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFatPercentageCard = () => {
    if (!isCaloriesSet || !isProteinSet) return null;

    const maxFatPercentage = calculateMaxFatPercentage(
      dailyTargets.calories,
      dailyTargets.protein
    );
    const fatGrams = calculateFatGramsFromPercentage(
      dailyTargets.calories,
      fatPercentage
    );
    const isInRecommendedRange = fatPercentage >= 25 && fatPercentage <= 35;

    const handleFatPercentageChange = (newPercentage: number) => {
      setFatPercentage(newPercentage);
      const newFatGrams = calculateFatGramsFromPercentage(
        dailyTargets.calories,
        newPercentage
      );
      const newCarbsGrams = calculateCarbsFromMacros(
        dailyTargets.calories,
        dailyTargets.protein,
        newFatGrams
      );

      updateDailyTargetsDebounced({
        ...dailyTargets,
        fat: newFatGrams,
        carbs: newCarbsGrams,
      });
    };

    return (
      <View style={styles.nutritionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={styles.nutritionHeadline}>
              Fine-Tune Fat Percentage
            </Text>
            <Text style={styles.cardDescription}>
              Adjust what percentage of your calories come from fat
            </Text>
          </View>
        </View>

        {/* Educational content */}
        <View style={styles.educationalCallout}>
          <Text style={styles.educationalTitle}>💡 Nutrition Tip</Text>
          <Text style={styles.educationalText}>
            For advanced strength athletes, a fat intake of 25-35% of total
            daily calories is recommended for optimal hormone production and
            nutrient absorption.
          </Text>
        </View>

        <NutritionSlider
          label="Fat Percentage"
          unit="%"
          value={fatPercentage}
          minimumValue={10}
          maximumValue={maxFatPercentage}
          step={1}
          onValueChange={handleFatPercentageChange}
        />

        <View
          style={[
            styles.fatCalculatedInfo,
            isInRecommendedRange && styles.fatCalculatedInfoRecommended,
          ]}
        >
          <Text
            style={[
              styles.fatCalculatedText,
              isInRecommendedRange && { color: colors.semantic.calories },
            ]}
          >
            {fatPercentage}% of {dailyTargets.calories} calories = {fatGrams}g
            fat
            {isInRecommendedRange && " ✓ Within recommended range"}
          </Text>
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
            Follow these steps to set up your personalized nutrition targets
          </Text>
          {/* Step 1: Calories */}
          <StepHeader
            stepNumber={1}
            title={stepInfo.step1.title}
            description={stepInfo.step1.description}
            helpText={stepInfo.step1.helpText}
            completed={stepInfo.step1.completed}
            colors={colors}
            styles={styles}
          />
          {renderNutritionCard(nutritionConfigs[0])} {/* Calories card */}
          <FlowArrow
            visible={stepInfo.step1.completed}
            colors={colors}
            styles={styles}
          />
          {/* Step 2: Protein */}
          <StepHeader
            stepNumber={2}
            title={stepInfo.step2.title}
            description={stepInfo.step2.description}
            helpText={stepInfo.step2.helpText}
            completed={stepInfo.step2.completed}
            colors={colors}
            styles={styles}
          />
          {renderNutritionCard(nutritionConfigs[1])} {/* Protein card */}
          <FlowArrow
            visible={stepInfo.step2.completed}
            colors={colors}
            styles={styles}
          />
          {/* Step 3: Fat & Carb Distribution */}
          {stepInfo.step1.completed && stepInfo.step2.completed && (
            <>
              <StepHeader
                stepNumber={3}
                title={stepInfo.step3.title}
                description={stepInfo.step3.description}
                helpText={stepInfo.step3.helpText}
                completed={stepInfo.step3.completed}
                colors={colors}
                styles={styles}
              />
              {renderMacroDistributionCard()}
              {renderFatPercentageCard()}
            </>
          )}
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
              <Text style={styles.resetButtonText}>Reset Daily Targets</Text>
            </Button>
          </View>
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
      borderRadius: 20,
      padding: spacing.xl,
      marginBottom: spacing.lg,
      ...componentStyles.cards,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 16,
      elevation: 2,
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
    calculationInfo: {
      backgroundColor: colors.semanticBadges.calories.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.calories,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationInfoProtein: {
      backgroundColor: colors.semanticBadges.protein.background,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: colors.semantic.protein,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 1,
    },
    calculationHeader: {
      marginBottom: spacing.sm,
    },
    calculationMethodTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    bodyWeightText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      opacity: 0.8,
    },
    calculatedValue: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.semantic.calories,
      marginBottom: spacing.sm,
    },
    calculatedValueProtein: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.semantic.protein,
      marginBottom: spacing.sm,
    },
    calculationSubtext: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 18,
      opacity: 0.7,
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
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    settingSubtext: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 20,
      opacity: 0.8,
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
    instructionalContainer: {
      backgroundColor: `${colors.accent}10`,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.accent}20`,
    },
    instructionalText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.accent,
      textAlign: "center",
    },
    resetButtonContainer: {
      marginTop: spacing.lg,
      alignItems: "center",
    },
    resetButton: {
      minWidth: 200,
    },
    resetButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      fontWeight: "600",
    },
    macroDistributionInfo: {
      backgroundColor: `${colors.accent}10`,
      borderRadius: 12,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: `${colors.accent}20`,
    },
    macroDistributionText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
      marginBottom: spacing.xs,
      flex: 1,
    },
    macroBreakdownRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    macroColorIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.sm,
    },
    fatCalculatedInfo: {
      backgroundColor: colors.semanticBadges.fat.background,
      borderRadius: 12,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    fatCalculatedText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.semantic.fat,
      textAlign: "center",
      fontWeight: "600",
    },
    fatCalculatedInfoRecommended: {
      backgroundColor: colors.semanticBadges.calories.background,
      borderWidth: 1,
      borderColor: `${colors.semantic.calories}30`,
    },
    educationalCallout: {
      backgroundColor: `${colors.semantic.fat}10`,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      borderLeftWidth: 3,
      borderLeftColor: colors.semantic.fat,
    },
    educationalTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: "600",
      color: colors.primaryText,
      marginBottom: spacing.xs,
    },
    educationalText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.primaryText,
      lineHeight: 22,
    },
    // Step header styles
    stepHeader: {
      marginBottom: spacing.lg,
    },
    stepTitleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.sm,
    },
    stepNumberContainer: {
      marginRight: spacing.md,
      marginTop: spacing.xs,
    },
    stepNumber: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    stepNumberText: {
      fontSize: typography.Caption.fontSize,
      fontFamily: typography.Caption.fontFamily,
      fontWeight: "700",
    },
    stepTitleContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      fontWeight: typography.Headline.fontWeight,
      color: colors.primaryText,
      marginBottom: spacing.xs / 2,
    },
    stepDescription: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      lineHeight: 22,
    },
    stepHelpContainer: {
      backgroundColor: `${colors.accent}08`,
      borderRadius: 8,
      padding: spacing.md,
      borderLeftWidth: 3,
      borderLeftColor: colors.accent,
    },
    stepHelpText: {
      fontSize: typography.Subhead.fontSize,
      fontFamily: typography.Subhead.fontFamily,
      color: colors.primaryText,
      lineHeight: 20,
      fontStyle: "italic",
    },
    // Flow arrow styles
    flowArrowContainer: {
      alignItems: "center",
      paddingVertical: spacing.md,
    },
  });
};
