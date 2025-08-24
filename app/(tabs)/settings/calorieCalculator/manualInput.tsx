import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/providers";
import { useFoodLogStore } from "src/legacystore/useFoodLogStore";
import { CalculatorInputAccessory } from "@/components/settings/CalculatorInputAccessory";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { saveCalorieCalculatorParams } from "@/lib/storage";

const inputAccessoryViewID = "calories-input-accessory";

const ManualCalorieInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const {
    dailyTargets,
    updateDailyTargets,
    calculatorParams,
    clearCalculatorData,
  } = useFoodLogStore();
  const { safeDismissTo, isNavigating } = useNavigationGuard();

  const [calories, setCalories] = useState<number>(
    dailyTargets?.calories && dailyTargets.calories > 0
      ? dailyTargets.calories
      : 2000
  );
  const inputRef = useRef<TextInput>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  useEffect(() => {
    if (dailyTargets?.calories && dailyTargets.calories > 0) {
      setCalories(dailyTargets.calories);
    }
  }, [dailyTargets?.calories]);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            inputRef.current?.focus();
          }, 600);
        });
      });
      return () => task.cancel();
    }, [])
  );

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

      safeDismissTo("/settings");
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
            Set your target calories per day. You can always adjust this later
            in settings.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={calories === 0 ? "" : calories.toString()}
              onChangeText={handleCaloriesChange}
              placeholder="2000"
              keyboardType="number-pad"
              keyboardAppearance={colorScheme}
              style={styles.caloriesInput}
              accessibilityLabel="Calorie input"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
            />
            <Text style={styles.unitText}>calories</Text>
          </View>
          <Text style={styles.selectedText}>per day</Text>
        </View>

        <View style={styles.spacer} />

        {Platform.OS === "android" && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleSave}
            disabled={isNavigating}
          >
            <Text style={styles.continueButtonText}>Save Goal</Text>
            <CaretRightIcon size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {Platform.OS === "ios" && (
        <CalculatorInputAccessory
          accessibilityLabel="Save Goal"
          nativeID={inputAccessoryViewID}
          isValid={calories >= 1000 && calories <= 5000}
          onContinue={handleSave}
          buttonText="Save Goal"
        />
      )}
    </SafeAreaView>
  );
};

export default ManualCalorieInputScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography, components } = themeObj;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    content: {
      flex: 1,
      paddingHorizontal: spacing.pageMargins.horizontal,
      gap: spacing.xxl,
    },
    textSection: { paddingTop: spacing.lg, gap: spacing.sm },
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
    },
    inputSection: { alignItems: "center" },
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
    spacer: { flex: 1 },
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
      marginRight: spacing.sm,
    },
    caloriesInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
  });
};
