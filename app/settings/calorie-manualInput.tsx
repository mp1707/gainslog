import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Card } from "@/components/Card";
import { Button } from "@/components/index";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { GradientWrapper } from "@/components/shared/GradientWrapper";

const isValidCalories = (calories: number | undefined) =>
  calories !== undefined && calories >= 1000 && calories <= 7000;

const ManualCalorieInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets, setDailyTargets } = useAppStore();
  const { safeDismissTo } = useNavigationGuard();
  const { back } = useRouter();

  const [calories, setCalories] = useState<number | undefined>(
    dailyTargets?.calories
  );
  const inputRef = useRef<TextInput>(null);

  const handleCancel = () => {
    back();
  };

  const handleSaveFromHeader = () => {
    handleSave();
  };

  useEffect(() => {
    if (dailyTargets?.calories && dailyTargets.calories > 0) {
      setCalories(dailyTargets.calories);
    }
  }, [dailyTargets?.calories]);

  useDelayedAutofocus(inputRef);

  const handleCaloriesChange = (caloriesText: string) => {
    if (caloriesText === "") {
      setCalories(undefined);
      return;
    }

    const newCalories = Number(caloriesText);

    if (isNaN(newCalories)) {
      setCalories(undefined);
      return;
    }

    setCalories(newCalories);
  };

  const handleSave = async () => {
    const newDailyTargets = {
      calories,
      protein: undefined,
      carbs: undefined,
      fat: undefined,
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
    <GradientWrapper style={styles.container}>
      <ModalHeader 
        title="Calorie Goal"
        onClose={handleCancel}
        closeAccessibilityLabel="Cancel editing"
        closeAccessibilityHint="Returns to previous screen without saving changes"
      />
      
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
              value={calories ? calories.toString() : ""}
              onChangeText={handleCaloriesChange}
              placeholder="2000"
              keyboardType="number-pad"
              keyboardAppearance={colorScheme}
              style={styles.caloriesInput}
              accessibilityLabel="Calorie input"
              selectTextOnFocus
            />
            <Text style={styles.unitText}>calories</Text>
          </View>
          <Text style={styles.selectedText}>per day</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
        <Card style={styles.keyboardAccessory}>
          <Button
            variant="primary"
            onPress={handleSave}
            iconPosition="right"
            disabled={!isValidCalories(calories)}
            icon={
              <ChevronRight
                size={20}
                color={
                  isValidCalories(calories) ? colors.black : colors.disabledText
                }
                strokeWidth={1.5}
              />
            }
          >
            Save Goal
          </Button>
        </Card>
      </KeyboardStickyView>
    </GradientWrapper>
  );
};

export default ManualCalorieInputScreen;

const createStyles = (colors: any, themeObj: any) => {
  const { spacing, typography } = themeObj;
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
    caloriesInput: {
      fontSize: 48,
      fontFamily: typography.Title1.fontFamily,
      color: colors.primaryText,
      textAlign: "center",
      minWidth: 100,
    },
    keyboardAccessory: {
      padding: themeObj.spacing.sm,
      marginHorizontal: themeObj.spacing.md,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: themeObj.spacing.sm,
    },
  });
};
