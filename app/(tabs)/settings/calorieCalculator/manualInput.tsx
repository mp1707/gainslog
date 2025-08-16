import React, { useState, useEffect, useMemo } from "react";
import { View, TouchableOpacity, Text, TextInput, Platform, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { CalculatorInputAccessory } from "@/shared/ui";
import { saveCalorieCalculatorParams } from "@/lib/storage";

const inputAccessoryViewID = "calories-input-accessory";

const ManualCalorieInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { dailyTargets, updateDailyTargets, calculatorParams, clearCalculatorData } = useFoodLogStore();

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const [calories, setCalories] = useState<number>(
    (dailyTargets?.calories && dailyTargets.calories > 0) ? dailyTargets.calories : 2000
  );

  // Update calories when store changes
  useEffect(() => {
    if (dailyTargets?.calories && dailyTargets.calories > 0) {
      setCalories(dailyTargets.calories);
    }
  }, [dailyTargets?.calories]);

  const handleCaloriesChange = (caloriesText: string) => {
    const newCalories = caloriesText === "" ? 0 : parseInt(caloriesText, 10);
    
    if (!isNaN(newCalories)) {
      setCalories(newCalories);
    }
  };

  const handleSave = async () => {
    if (calories < 1000 || calories > 5000) {
      Alert.alert(
        "Invalid Calorie Value",
        "Please enter a calorie value between 1000 and 5000.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const currentTargets = dailyTargets || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      const newTargets = {
        ...currentTargets,
        calories: calories,
      };

      await updateDailyTargets(newTargets);
      
      // Save existing calculator params to AsyncStorage if they exist
      if (calculatorParams) {
        await saveCalorieCalculatorParams(calculatorParams);
      }
      
      clearCalculatorData();
      router.replace("/settings");
    } catch (error) {
      console.error("Error saving manual calorie target:", error);
      Alert.alert(
        "Save Failed",
        "Failed to save your calorie target. Please check your connection and try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Enter your daily calorie goal</Text>
          <Text style={styles.description}>
            Set your target calories per day. You can always adjust this later in settings.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              value={calories === 0 ? "" : calories.toString()}
              onChangeText={handleCaloriesChange}
              placeholder="2000"
              keyboardType="number-pad"
              keyboardAppearance={colorScheme}
              style={styles.caloriesInput}
              accessibilityLabel="Calorie input"
              accessibilityHint="Enter your daily calorie goal between 1000 and 5000"
              accessibilityRole="spinbutton"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
              autoFocus
            />
            <Text style={styles.unitText}>calories</Text>
          </View>
          <Text style={styles.selectedText}>per day</Text>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save calorie goal and finish setup"
        >
          <Text style={styles.continueButtonText}>
            Save Goal
          </Text>
          <CaretRightIcon
            size={20}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Input Accessory View - iOS only */}
      {Platform.OS === 'ios' && (
        <CalculatorInputAccessory
          nativeID={inputAccessoryViewID}
          isValid={true}
          onContinue={handleSave}
          buttonText="Save Goal"
          accessibilityLabel="Save calorie goal and finish setup"
        />
      )}
    </SafeAreaView>
  )
};

export default ManualCalorieInputScreen;

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (colors: Colors, themeObj: Theme) => {
  const { spacing, typography, components } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: spacing.xxl,
    },
    textSection: {
      paddingTop: spacing.lg,
      gap: spacing.sm,
    },
    subtitle: {
      fontSize: typography.Title2.fontSize,
      fontFamily: typography.Title2.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
    },
    description: {
      fontSize: typography.Body.fontSize,
      fontFamily: typography.Body.fontFamily,
      color: colors.secondaryText,
      textAlign: "center",
      lineHeight: 22,
    },
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
      minHeight: 64,
    },
    progressContainer: {
      padding: spacing.md,
    },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 50,
      marginHorizontal: spacing.pageMargins.horizontal,
      marginBottom: spacing.lg,
    },
    continueButtonText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.white,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
    caloriesInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 120,
      backgroundColor: "transparent",
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },
  });
};
