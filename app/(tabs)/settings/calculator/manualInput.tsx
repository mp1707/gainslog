import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Alert,
  TextInput as RNTextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { NumericTextInput } from "@/shared/ui/atoms/NumericTextInput";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { StyleSheet } from "react-native";

export default function ManualCalorieInputScreen() {
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


  const updateCalories = (calorieText: string) => {
    setCalorieInput(calorieText);
    
    if (calorieText === '') {
      return; // Allow empty input
    }
    
    const calories = parseInt(calorieText, 10);
    if (!isNaN(calories)) {
      setSelectedCalories(calories);
    }
  };

  const isValidCalories = () => {
    if (calorieInput === '') return false;
    const calories = parseInt(calorieInput, 10);
    return !isNaN(calories) && calories >= 1000 && calories <= 5000;
  };

  const handleSave = async () => {
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
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <SafeAreaView style={styles.container} edges={["left", "right"]}>
        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.subtitle}>Enter your daily calorie goal</Text>
          <Text style={styles.description}>
            Set your target calories per day. You can always adjust this later
            in settings.
          </Text>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <NumericTextInput
                ref={inputRef}
                style={styles.calorieInput}
                value={calorieInput}
                onChangeText={updateCalories}
                min={1000}
                max={5000}
                placeholder="2000"
                accessibilityLabel="Calorie input"
                accessibilityHint="Enter your daily calorie goal between 1000 and 5000"
              />
              <Text style={styles.unitText}>calories</Text>
            </View>

            <Text style={styles.selectedText}>
              per day
            </Text>
          </View>

          {/* Save Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (isLoading || !isValidCalories()) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isLoading || !isValidCalories()}
              accessibilityRole="button"
              accessibilityLabel={
                isLoading
                  ? "Saving calorie goal..."
                  : "Save calorie goal and finish setup"
              }
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? "Saving..." : "Save Goal"}
              </Text>
              {!isLoading && <CaretRightIcon size={20} color="#FFFFFF" />}
            </TouchableOpacity>
          </View>
        </View>
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
    progressContainer: {
      paddingHorizontal: spacing.pageMargins.horizontal,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "space-between",
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      marginBottom: spacing.md,
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: spacing.lg,
    },
    inputSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "center",
      marginBottom: spacing.md,
    },
    calorieInput: {
      fontSize: typography.Title1.fontSize,
      fontFamily: typography.Title1.fontFamily,
      textAlign: "center",
      minWidth: 140,
    },
    unitText: {
      fontSize: typography.Title1.fontSize,
      fontFamily: typography.Title1.fontFamily,
      color: colors.secondaryText,
      marginLeft: spacing.sm,
    },
    selectedText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      fontWeight: "600",
    },
    navigationContainer: {
      paddingBottom: spacing.xl,
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: themeObj.components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonDisabled: {
      backgroundColor: colors.border,
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: "#FFFFFF",
      fontWeight: "600",
      marginRight: spacing.sm,
    },
  });
};
