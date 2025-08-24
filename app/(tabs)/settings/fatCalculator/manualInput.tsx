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
  InteractionManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/theme";
import { useFoodLogStore } from "src/store-legacy/useFoodLogStore";
import { CalculatorInputAccessory } from "@/components/settings/CalculatorInputAccessory";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import { calculateMaxFatPercentage } from "@/utils/nutritionCalculations";

const inputAccessoryViewID = "fat-input-accessory";

const ManualFatInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { dailyTargets } = useFoodLogStore();
  const { safeDismissTo, isNavigating } = useNavigationGuard();
  const { fatPercentage, handleFatPercentageChange } =
    useNutritionCalculations();

  const [fatPercent, setFatPercent] = useState<number>(fatPercentage);
  const inputRef = useRef<TextInput>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  const maxFatPercentage = calculateMaxFatPercentage(
    dailyTargets.calories,
    dailyTargets.protein
  );

  useEffect(() => {
    if (fatPercentage > 0) {
      setFatPercent(fatPercentage);
    }
  }, [fatPercentage]);

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

  const handleFatPercentChange = (fatText: string) => {
    const newFatPercent = fatText === "" ? 0 : parseInt(fatText, 10);

    if (!isNaN(newFatPercent)) {
      setFatPercent(newFatPercent);
    }
  };

  const handleSave = async () => {
    if (fatPercent < 10 || fatPercent > maxFatPercentage) {
      Alert.alert(
        "Invalid Fat Percentage",
        `Please enter a fat percentage between 10% and ${Math.round(
          maxFatPercentage
        )}%.`,
        [{ text: "OK" }]
      );
      return;
    }

    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      handleFatPercentageChange(fatPercent);

      safeDismissTo("/settings");
    } catch (error) {
      console.error("Error saving manual fat target:", error);
      Alert.alert(
        "Save Failed",
        "Failed to save your fat target. Please check your connection and try again."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Enter your daily fat goal</Text>
          <Text style={styles.description}>
            Set your target fat percentage of total calories. You can always
            adjust this later in settings.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={fatPercent === 0 ? "" : fatPercent.toString()}
              onChangeText={handleFatPercentChange}
              placeholder="30"
              keyboardType="number-pad"
              keyboardAppearance={colorScheme}
              style={styles.fatInput}
              accessibilityLabel="Fat percentage input"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
            />
            <Text style={styles.unitText}>%</Text>
          </View>
          <Text style={styles.selectedText}>of total calories</Text>
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
          isValid={fatPercent >= 10 && fatPercent <= maxFatPercentage}
          onContinue={handleSave}
          buttonText="Save Goal"
        />
      )}
    </SafeAreaView>
  );
};

export default ManualFatInputScreen;

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
    fatInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
  });
};
