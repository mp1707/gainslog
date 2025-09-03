import React, { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { calculateCarbsFromMacros } from "@/utils/nutritionCalculations";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { Card } from "@/components/Card";
import { Button } from "@/components/index";
import { useRouter } from "expo-router";
import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";

const ManualProteinInputScreen = () => {
  const { colors, theme: themeObj, colorScheme } = useTheme();
  const styles = createStyles(colors, themeObj);
  const { dailyTargets, setDailyTargets } = useAppStore();
  const { safeDismissTo } = useNavigationGuard();
  const { back } = useRouter();
  const [protein, setProtein] = useState<number | undefined>(
    dailyTargets?.protein || 0
  );
  const inputRef = useRef<TextInput>(null);

  useDelayedAutofocus(inputRef);

  const handleCancel = () => {
    back();
  };

  const handleSaveFromHeader = () => {
    handleSave();
  };

  const handleProteinChange = (proteinText: string) => {
    const newProtein = proteinText === "" ? 0 : Number(proteinText);
    setProtein(newProtein);
  };

  const handleSave = async () => {
    const newDailyTargets = {
      ...dailyTargets,
      protein,
      carbs: calculateCarbsFromMacros(
        dailyTargets?.calories || 0,
        protein || 0,
        dailyTargets?.fat || 0
      ),
    };
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDailyTargets(newDailyTargets);
    safeDismissTo("/settings");
  };

  return (
    <View style={styles.container}>
      <ModalHeader 
        leftButton={{ label: "Cancel", onPress: handleCancel }}
        rightButton={{ label: "Save", onPress: handleSaveFromHeader, disabled: !protein }}
      />
      
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.subtitle}>Enter your daily protein goal</Text>
          <Text style={styles.description}>
            Set your target protein per day. You can always adjust this later in
            settings.
          </Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              value={protein ? protein.toString() : ""}
              onChangeText={handleProteinChange}
              placeholder="100"
              keyboardType="number-pad"
              keyboardAppearance={colorScheme}
              style={styles.proteinInput}
              accessibilityLabel="Protein input"
              selectTextOnFocus
            />
            <Text style={styles.unitText}>grams</Text>
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
            disabled={!protein}
            icon={
              <ChevronRight
                size={20}
                color={!protein ? colors.disabledText : colors.black}
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

export default ManualProteinInputScreen;

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
    proteinInput: {
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
