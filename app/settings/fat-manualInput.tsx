import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import {
  calculateCarbsFromMacros,
  calculateFatGramsFromPercentage,
  calculateMaxFatPercentage,
} from "@/utils/nutritionCalculations";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Card } from "@/components/Card";
import { Button } from "@/components/index";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";

const ManualFatInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets, setDailyTargets, userSettings, setUserSettings } =
    useAppStore();
  const { safeDismissTo } = useNavigationGuard();
  const { back } = useRouter();
  const [fatPercent, setFatPercent] = useState<number>(
    userSettings?.fatCalculationPercentage || 30
  );
  const inputRef = useRef<TextInput>(null);

  const handleCancel = () => {
    back();
  };

  const handleSaveFromHeader = () => {
    handleSave();
  };

  const maxFatPercentage = calculateMaxFatPercentage(
    dailyTargets?.calories || 0,
    dailyTargets?.protein || 0
  );

  useDelayedAutofocus(inputRef);

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
      carbs: calculateCarbsFromMacros(
        dailyTargets?.calories || 0,
        dailyTargets?.protein || 0,
        fat
      ),
    };
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDailyTargets(newDailyTargets);
    if (!userSettings) return;
    setUserSettings({ ...userSettings, fatCalculationPercentage: fatPercent });
    safeDismissTo("/settings");
  };

  return (
    <View style={styles.container}>
      <ModalHeader onCancel={handleCancel} onSave={handleSaveFromHeader} disabled={!fatPercent} />
      
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
              selectTextOnFocus
            />
            <Text style={styles.unitText}>%</Text>
          </View>
          <Text style={styles.selectedText}>of total calories</Text>
        </View>

        <View style={styles.spacer} />
      </View>

      <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
        <Card style={styles.keyboardAccessory}>
          <Button
            variant="primary"
            onPress={handleSave}
            iconPosition="right"
            disabled={!fatPercent}
            icon={
              <ChevronRight
                size={20}
                color={!fatPercent ? colors.disabledText : colors.white}
                strokeWidth={2.5}
              />
            }
          >
            Save Goal
          </Button>
        </Card>
      </KeyboardStickyView>
    </View>
  );
};

export default ManualFatInputScreen;

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
    fatInput: {
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
