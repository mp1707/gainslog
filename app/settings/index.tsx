import React, { useCallback, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Card, AppText, Button } from "src/components";
import { Check, ChevronRight, Gem, X } from "lucide-react-native";
import { AppearanceCard } from "@/components/settings/AppearanceCard";
import { seedFoodLogs } from "@/utils/seed";
import { RoundButton } from "@/components/shared/RoundButton";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RestorePurchasesButton } from "@/components/shared/RestorePurchasesButton";
import * as Haptics from "expo-haptics";

export default function SettingsTab() {
  const { colors, theme: themeObj } = useTheme();
  const keyboardOffset = useKeyboardOffset(true);
  const { safeNavigate, safeBack, isNavigating } = useNavigationGuard();
  const {
    clearAllLogs,
    clearNutritionGoals,
    isPro,
    isProCanceled,
    proExpirationDate,
    isVerifyingSubscription,
    setPro,
  } = useAppStore();

  const styles = useMemo(
    () => createStyles(colors, themeObj, keyboardOffset),
    [colors, themeObj, keyboardOffset]
  );

  const formattedExpirationDate = useMemo(() => {
    if (!proExpirationDate) {
      return undefined;
    }

    const date = new Date(proExpirationDate);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [proExpirationDate]);

  const cancellationDescription = useMemo(() => {
    if (!isProCanceled) {
      return undefined;
    }

    if (formattedExpirationDate) {
      return `Auto-renew has been canceled. You'll keep Macroloop Pro through ${formattedExpirationDate}.`;
    }

    return "Auto-renew has been canceled. You'll keep Macroloop Pro until the end of this billing period.";
  }, [formattedExpirationDate, isProCanceled]);

  // Nutrition calculators moved under /Goals; provide a single entry link

  const handleClose = () => {
    safeBack();
  };

  const handleSeedData = () => {
    seedFoodLogs();
  };

  const handleClearAllLogs = () => {
    Alert.alert(
      "Clear All Food Logs",
      "Are you sure you want to delete all food logs? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => clearAllLogs(),
        },
      ],
      { cancelable: true }
    );
  };

  const handleClearNutritionGoals = () => {
    Alert.alert(
      "Clear Nutrition Goals",
      "Are you sure you want to clear all nutrition goals (calories, protein, carbs, fat)? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear Goals",
          style: "destructive",
          onPress: () => clearNutritionGoals(),
        },
      ],
      { cancelable: true }
    );
  };

  const handleShowPaywall = useCallback(() => {
    Haptics.impactAsync(themeObj.interactions.haptics.light).catch(
      () => undefined
    );
    safeNavigate("/paywall");
  }, [safeNavigate, themeObj.interactions.haptics.light]);

  const handleTogglePro = () => {
    setPro(!isPro);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <GradientWrapper style={styles.container}>
        <View style={styles.closeButton}>
          <RoundButton
            onPress={handleClose}
            Icon={X}
            variant="tertiary"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to previous screen"
          />
        </View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          <View style={styles.header}>
            <AppText role="Title1" style={styles.headerTitle}>
              Settings
            </AppText>
            {/* <AppText role="Body" color="secondary">
              Tailor MacroLoop to match your workflow.
            </AppText> */}
          </View>

          {!isPro && !isVerifyingSubscription && (
            <View style={styles.section}>
              <AppText
                role="Caption"
                color="secondary"
                style={styles.sectionLabel}
              >
                Pro
              </AppText>
              <Card>
                <TouchableOpacity
                  style={styles.proInviteContent}
                  onPress={handleShowPaywall}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Unlock Macroloop Pro"
                  accessibilityHint="Opens the paywall to start a free trial"
                >
                  <View style={styles.proInviteIconWrapper}>
                    <Gem size={22} color={colors.black} />
                  </View>
                  <View style={styles.proInviteText}>
                    <AppText role="Headline" style={styles.proInviteTitle}>
                      Unlock Macroloop Pro
                    </AppText>
                    <AppText role="Caption" color="secondary">
                      Access the AI engine for faster, smarter tracking.
                    </AppText>
                  </View>
                  <ChevronRight
                    size={18}
                    color={colors.secondaryText}
                    strokeWidth={1.5}
                  />
                </TouchableOpacity>
              </Card>
            </View>
          )}

          <View style={styles.section}>
            <AppText
              role="Caption"
              color="secondary"
              style={styles.sectionLabel}
            >
              Personalization
            </AppText>
            <AppearanceCard />
          </View>

          <View style={styles.section}>
            <AppText
              role="Caption"
              color="secondary"
              style={styles.sectionLabel}
            >
              Goals
            </AppText>
            <Card>
              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => safeNavigate("/onboarding")}
                disabled={isNavigating}
                accessibilityRole="button"
                accessibilityLabel="Set nutrition goals"
                accessibilityHint="Opens the onboarding flow to set your nutrition goals"
              >
                <View style={styles.settingInfo}>
                  <AppText role="Headline" style={styles.settingTitle}>
                    Nutrition targets
                  </AppText>
                  <AppText role="Body" color="secondary">
                    Adjust your daily calorie and macro goals.
                  </AppText>
                </View>
                <ChevronRight
                  size={18}
                  color={colors.secondaryText}
                  strokeWidth={1.5}
                />
              </TouchableOpacity>
            </Card>
          </View>

          <View style={styles.section}>
            <AppText
              role="Caption"
              color="secondary"
              style={styles.sectionLabel}
            >
              Developer
            </AppText>
            <Card>
              <View style={styles.cardHeader}>
                <AppText role="Headline" style={styles.settingTitle}>
                  Developer toolkit
                </AppText>
                <AppText role="Body" color="secondary">
                  Quick utilities for testing flows during development.
                </AppText>
              </View>
              <View style={styles.buttonStack}>
                <Button
                  label="Seed sample logs"
                  variant="secondary"
                  onPress={handleSeedData}
                  style={styles.fullWidthButton}
                />
                <Button
                  label="Clear all food logs"
                  variant="tertiary"
                  onPress={handleClearAllLogs}
                  style={[styles.fullWidthButton, styles.buttonSpacing]}
                />
                <Button
                  label="Clear nutrition goals"
                  variant="tertiary"
                  onPress={handleClearNutritionGoals}
                  style={[styles.fullWidthButton, styles.buttonSpacing]}
                />
                <Button
                  label={`Pro: ${isPro ? "ON" : "OFF"}`}
                  variant="tertiary"
                  onPress={handleTogglePro}
                  style={[styles.fullWidthButton, styles.buttonSpacing]}
                />
              </View>
            </Card>
          </View>
        </ScrollView>
      </GradientWrapper>
    </KeyboardAvoidingView>
  );
}

type Colors = ReturnType<typeof useTheme>["colors"];
type Theme = ReturnType<typeof useTheme>["theme"];

const createStyles = (
  colors: Colors,
  themeObj: Theme,
  bottomPadding?: number
) => {
  const { spacing } = themeObj;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    closeButton: {
      position: "absolute",
      top: spacing.md,
      right: spacing.md,
      zIndex: 15,
    },
    centered: {
      justifyContent: "center",
      alignItems: "center",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: themeObj.spacing.pageMargins.horizontal,
      paddingTop: spacing.xxl,
      paddingBottom: bottomPadding || spacing.xl,
    },
    header: {
      marginBottom: spacing.xl,
    },
    headerTitle: {
      marginBottom: spacing.xs,
    },
    proInviteContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      width: "100%",
    },
    proInviteIconWrapper: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    proInviteText: {
      flex: 1,
      gap: spacing.xs,
    },
    proInviteTitle: {
      color: colors.primaryText,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionLabel: {
      marginBottom: spacing.sm,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    proCard: {
      marginBottom: spacing.xl,
    },
    proBadge: {
      marginBottom: spacing.xs,
    },
    cardTitle: {
      marginBottom: spacing.xs,
    },
    cardDescription: {
      marginBottom: spacing.lg,
    },
    proFeatures: {
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    proFeatureRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: spacing.sm,
    },
    proFeatureIcon: {
      width: 24,
      marginTop: spacing.xs,
      alignItems: "center",
    },
    proFeatureText: {
      flex: 1,
      gap: spacing.xs,
    },
    proFeatureTitle: {
      color: colors.primaryText,
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: spacing.lg,
      marginBottom: spacing.sm,
    },
    statusPillText: {
      marginLeft: spacing.xs,
      color: colors.primaryBackground,
    },
    proFooterText: {
      marginTop: spacing.sm,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
    },
    settingInfo: {
      flex: 1,
      marginRight: spacing.lg,
    },
    settingTitle: {
      marginBottom: spacing.xs,
    },
    cardHeader: {
      marginBottom: spacing.lg,
    },
    buttonStack: {
      marginTop: spacing.md,
    },
    fullWidthButton: {
      width: "100%",
    },
    buttonSpacing: {
      marginTop: spacing.sm,
    },
  });
};
