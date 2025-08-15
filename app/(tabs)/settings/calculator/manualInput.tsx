import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  Alert,
  TextInput as RNTextInput,
  InteractionManager,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { NumericTextInput } from "@/shared/ui/atoms/NumericTextInput";
import { 
  CalculatorScreenLayout, 
  CalculatorInputAccessory, 
  CalculatorHeader 
} from "@/shared/ui/components";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { StyleSheet } from "react-native";

const ManualCalorieInputScreen = React.memo(function ManualCalorieInputScreen() {
  const { colors, theme: themeObj } = useTheme();
  const { dailyTargets, updateDailyTargets, clearCalculatorData } =
    useFoodLogStore();

  // Use current calorie target as starting value, default to 2000
  const [selectedCalories, setSelectedCalories] = useState<number>(
    dailyTargets?.calories && dailyTargets.calories > 0
      ? dailyTargets.calories
      : 2000
  );
  const [calorieInput, setCalorieInput] = useState<string>(
    (dailyTargets?.calories && dailyTargets.calories > 0
      ? dailyTargets.calories
      : 2000
    ).toString()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const inputRef = useRef<RNTextInput>(null);
  const inputAccessoryViewID = "calorieInputAccessory";

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );


  useEffect(() => {
    // Update selected calories if daily targets change
    if (dailyTargets?.calories && dailyTargets.calories > 0) {
      setSelectedCalories(dailyTargets.calories);
      setCalorieInput(dailyTargets.calories.toString());
    }
  }, [dailyTargets?.calories]);

  // Auto-focus input when screen mounts - wait for animation to fully complete
  useEffect(() => {
    const handle = InteractionManager.runAfterInteractions(() => {
      // Additional delay to ensure navigation animation is visually complete
      const focusTimer = setTimeout(() => {
        inputRef.current?.focus();
      }, 400); // 400ms total delay for smooth animation completion
      
      return () => clearTimeout(focusTimer);
    });

    return () => handle.cancel();
  }, []);


  const updateCalories = useCallback((calorieText: string) => {
    setCalorieInput(calorieText);
    
    if (calorieText === '') {
      return; // Allow empty input
    }
    
    const calories = parseInt(calorieText, 10);
    if (!isNaN(calories)) {
      setSelectedCalories(calories);
    }
  }, []);

  const isValidCalories = useCallback(() => {
    if (calorieInput === '') return false;
    const calories = parseInt(calorieInput, 10);
    return !isNaN(calories) && calories >= 1000 && calories <= 5000;
  }, [calorieInput]);

  const handleSave = useCallback(async () => {
    // Prevent multiple rapid saves
    if (isLoading) return;

    // Validate input
    const calories = parseInt(calorieInput, 10);
    if (isNaN(calories) || calories < 1000 || calories > 5000) {
      Alert.alert(
        "Invalid Calorie Value",
        "Please enter a calorie value between 1000 and 5000."
      );
      return;
    }

    // Update selected calories from input
    setSelectedCalories(calories);

    // Dismiss keyboard first, then continue
    inputRef.current?.blur();
    setIsLoading(true);

    try {
      // Provide haptic feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Ensure we have valid daily targets to update
      const currentTargets = dailyTargets || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      // Update the daily targets with the manually entered calories
      const newTargets = {
        ...currentTargets,
        calories: calories,
      };

      await updateDailyTargets(newTargets);

      // Clear calculator data since we're skipping the flow
      clearCalculatorData();

      // Navigate back to settings
      router.replace("/settings");
    } catch (error) {
      console.error("Error saving manual calorie target:", error);
      Alert.alert(
        "Save Failed",
        "Failed to save your calorie target. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, calorieInput, dailyTargets, updateDailyTargets, clearCalculatorData]);

  return (
    <CalculatorScreenLayout
      currentStep={1}
      totalSteps={1}
      progressLabel="Manual calorie input"
    >
      <CalculatorHeader
        title="Enter your daily calorie goal"
        description="Set your target calories per day. You can always adjust this later in settings."
      />

      <View style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <NumericTextInput
            ref={inputRef}
            value={calorieInput}
            onChangeText={updateCalories}
            min={1000}
            max={5000}
            placeholder="2000"
            accessibilityLabel="Calorie input"
            accessibilityHint="Enter your daily calorie goal between 1000 and 5000"
            inputAccessoryViewID={inputAccessoryViewID}
            extraLarge
            borderless
            integerOnly
          />
          <Text style={styles.unitText}>calories</Text>
        </View>

        <Text style={styles.selectedText}>
          per day
        </Text>
      </View>

      {/* Spacer to push content up and provide consistent spacing */}
      <View style={styles.spacer} />

      {/* Input Accessory View */}
      <CalculatorInputAccessory
        nativeID={inputAccessoryViewID}
        isValid={isValidCalories() && !isLoading}
        onContinue={handleSave}
        buttonText={isLoading ? "Saving..." : "Save Goal"}
        accessibilityLabel={
          isLoading
            ? "Saving calorie goal..."
            : "Save calorie goal and finish setup"
        }
      />
    </CalculatorScreenLayout>
  );
});

export default ManualCalorieInputScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography } = themeObj;

  return StyleSheet.create({
    inputSection: {
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
    },
    unitText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.secondaryText,
      marginLeft: spacing.sm,
    },
    selectedText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      fontWeight: "600",
      marginTop: spacing.md,
    },
    spacer: {
      flex: 1,
      minHeight: spacing.xxl * 2, // Ensure minimum spacing
    },
  });
};
