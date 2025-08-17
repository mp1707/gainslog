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
import { useFoodLogStore } from "@/stores/useFoodLogStore";
import { ProgressBar } from "@/shared/ui/molecules/ProgressBar";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";
import { CalculatorInputAccessory } from "@/shared/ui";

const inputAccessoryViewID = "height-input-accessory";

const HeightSelectionScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const { calculatorParams, setCalculatorParams } = useFoodLogStore();
  const { safeNavigate, isNavigating } = useNavigationGuard();

  const [height, setHeight] = useState<number>(calculatorParams?.height ?? 175);
  const inputRef = useRef<TextInput>(null);

  const styles = useMemo(
    () => createStyles(colors, themeObj),
    [colors, themeObj]
  );

  useEffect(() => {
    if (calculatorParams?.height !== undefined) {
      setHeight(calculatorParams.height);
    }
  }, [calculatorParams?.height]);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => inputRef.current?.focus());
      });
      return () => task.cancel();
    }, [])
  );

  const handleHeightChange = (heightText: string) => {
    const newHeight = heightText === "" ? 0 : parseFloat(heightText);
    
    if (!isNaN(newHeight)) {
      setHeight(newHeight);

      const updatedParams = {
        ...calculatorParams,
        sex: calculatorParams?.sex ?? "male",
        age: calculatorParams?.age ?? 30,
        weight: calculatorParams?.weight ?? 70,
        height: newHeight,
      };
      setCalculatorParams(updatedParams);
    }
  };

  const handleContinue = async () => {
    if (height < 100 || height > 250) {
      Alert.alert(
        "Invalid Height",
        "Please enter a valid height between 100 and 250 cm.",
        [{ text: "OK" }]
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeNavigate({ route: "/settings/calorieCalculator/activity-level" });
  };

  return (
    <SafeAreaView style={styles.container} edges={["left", "right"]}>
      <View style={styles.progressContainer}>
        <ProgressBar
          totalSteps={6}
          currentStep={4}
          accessibilityLabel={`Calculator progress: step 4 of 6`}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>How tall are you?</Text>
          <Text style={styles.description}>
            Your height is used to calculate your daily calorie needs.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={height === 0 ? "" : height.toString()}
              onChangeText={handleHeightChange}
              placeholder="175"
              keyboardType="numeric"
              keyboardAppearance={colorScheme}
              style={styles.heightInput}
              accessibilityLabel="Height input"
              inputAccessoryViewID={inputAccessoryViewID}
              selectTextOnFocus
            />
            <Text style={styles.unitText}>cm</Text>
          </View>
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
        <CalculatorInputAccessory
          accessibilityLabel="Continue"
          nativeID={inputAccessoryViewID}
          isValid={height >= 100 && height <= 250}
          onContinue={handleContinue}
        />
      )}
    </SafeAreaView>
  )
};

export default HeightSelectionScreen;

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
    heightInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
  });
};
