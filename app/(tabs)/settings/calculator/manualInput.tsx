import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  // Generate calorie options (1000-5000 in 50-calorie increments)
  const calorieOptions = useMemo(() => {
    return Array.from({ length: 81 }, (_, i) => 1000 + i * 50); // 1000, 1050, 1100, ..., 5000
  }, []);

  useEffect(() => {
    // Update selected calories if daily targets change
    if (dailyTargets?.calories && dailyTargets.calories > 0) {
      setSelectedCalories(dailyTargets.calories);
    }
  }, [dailyTargets?.calories]);

  const handleSave = async () => {
    // Prevent multiple rapid saves
    if (isLoading) return;

    // Validate input
    if (
      !selectedCalories ||
      selectedCalories < 1000 ||
      selectedCalories > 5000
    ) {
      Alert.alert(
        "Invalid Calorie Value",
        "Please select a calorie value between 1000 and 5000."
      );
      return;
    }

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
        calories: selectedCalories,
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

          <View style={styles.pickerSection}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedCalories}
                onValueChange={(value: number) => {
                  // Validate picker value
                  if (
                    typeof value === "number" &&
                    value >= 1000 &&
                    value <= 5000
                  ) {
                    setSelectedCalories(value);
                  }
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {calorieOptions.map((calories) => (
                  <Picker.Item
                    key={calories}
                    label={`${calories} calories`}
                    value={calories}
                  />
                ))}
              </Picker>
            </View>

            <Text style={styles.selectedText}>
              {selectedCalories} calories per day
            </Text>
          </View>

          {/* Save Button */}
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                isLoading && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isLoading}
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
    pickerSection: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    pickerContainer: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: themeObj.components.buttons.cornerRadius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      width: "80%",
      maxWidth: 280,
      marginBottom: spacing.md,
    },
    picker: {
      height: 200,
      color: colors.primaryText,
    },
    pickerItem: {
      fontSize: typography.Body.fontSize,
      color: colors.primaryText,
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
