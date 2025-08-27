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
import { useAppStore } from "@/store/useAppStore";
import { CalculatorInputAccessory } from "@/components/settings/CalculatorInputAccessory";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import {
  calculateFatGramsFromPercentage,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";

const inputAccessoryViewID = "fat-input-accessory";

const ManualFatInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets, setDailyTargets, userSettings, setUserSettings } =
    useAppStore();
  const { safeDismissTo, isNavigating } = useNavigationGuard();
  const [fatPercent, setFatPercent] = useState<number>(
    userSettings?.fatCalculationPercentage || 30
  );
  const inputRef = useRef<TextInput>(null);

  const maxFatPercentage = calculateMaxFatPercentage(
    dailyTargets?.calories || 0,
    dailyTargets?.protein || 0
  );

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
    const newFatPercent = fatText === "" ? 0 : Number(fatText);
    setFatPercent(newFatPercent);
  };

  const handleSave = async () => {
    const fat = calculateFatGramsFromPercentage(
      dailyTargets?.calories || 0,
      fatPercent
    );
    const newDailyTargets = {
      ...dailyTargets,
      fat,
    };
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDailyTargets(newDailyTargets);
    if (!userSettings) return;
    setUserSettings({ ...userSettings, fatCalculationPercentage: fatPercent }); 
    safeDismissTo("/settings");
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
