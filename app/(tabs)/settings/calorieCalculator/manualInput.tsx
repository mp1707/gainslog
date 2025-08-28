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

import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { InputAccessory } from "@/components/shared/InputAccessory";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

const inputAccessoryViewID = "calories-input-accessory";

const isValidCalories = (calories: number | undefined) =>
  calories !== undefined && calories >= 1000 && calories <= 7000;

const ManualCalorieInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets, setDailyTargets } = useAppStore();
  const { safeDismissTo, isNavigating } = useNavigationGuard();

  const [calories, setCalories] = useState<number | undefined>(
    dailyTargets?.calories
  );
  const inputRef = useRef<TextInput>(null);

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
    const newCalories = caloriesText === "" ? undefined : Number(caloriesText);

    if (!newCalories) return;

    setCalories(newCalories);
  };

  const handleSave = async () => {
    const newDailyTargets = {
      ...dailyTargets,
      calories,
    };
    if (!isValidCalories(calories)) {
      Alert.alert(
        "Invalid Calorie Value",
        "Please enter a calorie value between 1000 and 7000.",
        [{ text: "OK" }]
      );
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDailyTargets(newDailyTargets);
    safeDismissTo("/settings");
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
              value={calories?.toString()}
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
        <InputAccessory
          accessibilityLabel="Save Goal"
          nativeID={inputAccessoryViewID}
          primaryAction={{
            icon: CaretRightIcon,
            label: "Save Goal",
            onPress: handleSave,
            isValid: isValidCalories(calories),
          }}
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
