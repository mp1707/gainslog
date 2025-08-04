import React, { useState, useEffect, useMemo } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Stepper } from "../../atoms/Stepper/Stepper";
import {
  CalorieCalculationCard,
  CALCULATION_METHODS,
  CalorieCalculationMethod,
} from "../../atoms/CalorieCalculationCard";
import { GoalSelectionCard, GoalType } from "../../atoms/GoalSelectionCard";
import {
  calculateCalorieGoals,
  CalorieIntakeParams,
  ActivityLevel,
  Sex,
} from "../../../../utils/calculateCalories";
import { useStyles } from "./CalorieCalculatorModal.styles";
import { 
  getCalorieCalculatorParams, 
  saveCalorieCalculatorParams 
} from "../../../../lib/storage";

interface CalorieCalculatorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectGoal: (
    goalType: GoalType,
    calories: number,
    params: CalorieIntakeParams,
    activityLevel: ActivityLevel
  ) => void;
  initialParams?: Partial<CalorieIntakeParams>;
  initialActivityLevel?: ActivityLevel;
}

export const CalorieCalculatorModal: React.FC<CalorieCalculatorModalProps> = ({
  visible,
  onClose,
  onSelectGoal,
  initialParams = {},
}) => {
  const styles = useStyles();

  // Create a stable initial params object to prevent re-renders
  const stableInitialParams = useMemo(
    () => ({
      sex: "male" as Sex,
      age: 30,
      weight: 85,
      height: 175,
      ...initialParams,
    }),
    [
      initialParams.sex,
      initialParams.age,
      initialParams.weight,
      initialParams.height,
    ]
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [params, setParams] =
    useState<CalorieIntakeParams>(stableInitialParams);
  const [selectedActivityLevel, setSelectedActivityLevel] =
    useState<ActivityLevel | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [isParamsLoaded, setIsParamsLoaded] = useState(false);

  // Animation setup for sliding toggle
  const slideAnimation = useSharedValue(params.sex === "male" ? 0 : 1);

  // Update animation when sex changes
  useEffect(() => {
    slideAnimation.value = withTiming(params.sex === "male" ? 0 : 1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [params.sex]);

  // Animated style for sliding indicator
  const animatedSliderStyle = useAnimatedStyle(() => {
    // Calculate the available sliding space accounting for padding
    // Container has 3pt padding on each side, slider width is 50%
    // So the slider can move from 0 to the remaining 50% width minus 4pt offset
    const slideDistance = slideAnimation.value * 101;
    return {
      transform: [
        {
          translateX: `${slideDistance}%`,
        },
      ],
    };
  }, []);

  // Reset modal state when opened/closed
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
      setSelectedActivityLevel(null);
      setSelectedGoal(null);
    } else {
      setIsParamsLoaded(false);
    }
  }, [visible]);

  // Load saved params when modal opens (only once)
  useEffect(() => {
    const loadSavedParams = async () => {
      if (visible && !isParamsLoaded) {
        try {
          const savedParams = await getCalorieCalculatorParams();
          const mergedParams = { ...savedParams, ...initialParams };
          setParams(mergedParams);
          // Update animation to match loaded params
          slideAnimation.value = mergedParams.sex === "male" ? 0 : 1;
          setIsParamsLoaded(true);
        } catch (error) {
          console.error("Failed to load saved params:", error);
          setParams(stableInitialParams);
          slideAnimation.value = stableInitialParams.sex === "male" ? 0 : 1;
          setIsParamsLoaded(true);
        }
      }
    };

    loadSavedParams();
  }, [visible, stableInitialParams, initialParams]);

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

  const handleGoalSelect = (goalType: GoalType) => {
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

    onSelectGoal(goalType, calories, params, selectedActivityLevel);
    onClose();
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

  const toggleSex = () => {
    setParams((prev) => ({
      ...prev,
      sex: prev.sex === "male" ? "female" : "male",
    }));
  };

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
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar style="dark" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={currentStep > 0 ? handlePrevStep : onClose}
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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="position"
          keyboardVerticalOffset={100}
        >
          <ScrollView
            style={styles.content}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
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
                <View style={styles.sexToggleContainer}>
                  {/* Animated sliding background */}
                  <Animated.View
                    style={[styles.sexToggleSlider, animatedSliderStyle]}
                  />

                  {/* Static buttons with text */}
                  <TouchableOpacity
                    onPress={() => updateParam("sex", "male")}
                    style={styles.sexToggleButton}
                    accessibilityRole="button"
                    accessibilityLabel="Select male"
                    accessibilityState={{ selected: params.sex === "male" }}
                  >
                    <Text
                      style={[
                        styles.sexToggleButtonText,
                        params.sex === "male" &&
                          styles.sexToggleButtonTextSelected,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => updateParam("sex", "female")}
                    style={styles.sexToggleButton}
                    accessibilityRole="button"
                    accessibilityLabel="Select female"
                    accessibilityState={{ selected: params.sex === "female" }}
                  >
                    <Text
                      style={[
                        styles.sexToggleButtonText,
                        params.sex === "female" &&
                          styles.sexToggleButtonTextSelected,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
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
                Select the option that best matches your lifestyle and exercise
                routine.
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
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};
