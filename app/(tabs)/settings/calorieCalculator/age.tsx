import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { InteractionManager } from "react-native";
import { CaretRightIcon } from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { ProgressBar } from "@/components/settings/ProgressBar";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { InputAccessory } from "@/components/shared/InputAccessory";
import { useAppStore } from "@/store/useAppStore";

const inputAccessoryViewID = "age-input-accessory";

const isValidAge = (age: number | undefined) =>
  age !== undefined && age >= 15 && age <= 100;

const AgeSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { userSettings, setUserSettings } = useAppStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();
  const [age, setAge] = useState<number | undefined>(userSettings?.age);
  const inputRef = useRef<TextInput>(null);

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

  const handleContinue = async () => {
    if (!isValidAge(age)) return;
    if (!age) return;
    if (!userSettings) return;
    setUserSettings({ ...userSettings, age: age });
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate("/settings/calorieCalculator/weight");
  };

  const handleAgeChange = (age: string) => {
    const newAge = Number(age);
    setAge(newAge);
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={2}
          accessibilityLabel="Step 2 of 6"
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How old are you?</Text>
          <Text style={styles.description}>
            Your age helps us calculate your calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            ref={inputRef}
            value={age?.toString()}
            onChangeText={handleAgeChange}
            placeholder="30"
            keyboardType="numeric"
            keyboardAppearance={colorScheme}
            style={styles.ageInput}
            accessibilityLabel="Age input"
            inputAccessoryViewID={inputAccessoryViewID}
            selectTextOnFocus
          />
        </View>

        <View style={styles.spacer} />

        {Platform.OS === "android" && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            disabled={isNavigating}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <CaretRightIcon size={20} color={colors.white} />
          </TouchableOpacity>
        )}
      </View>

      {Platform.OS === "ios" && (
        <InputAccessory
          accessibilityLabel="Continue"
          nativeID={inputAccessoryViewID}
          isValid={isValidAge(age)}
          onPrimaryPress={handleContinue}
        />
      )}
    </SafeAreaView>
  );
};

export default AgeSelectionScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography, components } = themeObj;
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.primaryBackground },
    progressContainer: { padding: spacing.md },
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
    ageInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
    spacer: { flex: 1 },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: components.buttons.cornerRadius,
      paddingVertical: spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      marginHorizontal: spacing.pageMargins.horizontal,
      marginBottom: spacing.lg,
    },
    continueButtonText: {
      fontSize: typography.Headline.fontSize,
      fontFamily: typography.Headline.fontFamily,
      color: colors.white,
      marginRight: spacing.sm,
    },
  });
};
