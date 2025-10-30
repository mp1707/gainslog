import React, { useMemo, useCallback, useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Crown, BadgeCheck, RotateCcw } from "lucide-react-native";
import Purchases from "react-native-purchases";

import { AppText } from "@/components";
import { SettingRow } from "../SettingRow";
import { useTheme, Colors, Theme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

const PROMO_LINK = "/paywall";

export const ProSection = () => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { safeNavigate } = useNavigationGuard();
  const { isPro, isProCanceled, proExpirationDate, isVerifyingSubscription } =
    useAppStore();
  const [isRestoringPurchases, setRestoringPurchases] = useState(false);

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
      return "Billing & plan.";
    }

    if (formattedExpirationDate) {
      return `Auto-renew canceled. Access through ${formattedExpirationDate}.`;
    }

    return "Auto-renew canceled. Access until current period ends.";
  }, [formattedExpirationDate, isProCanceled]);

  const handleShowPaywall = useCallback(() => {
    safeNavigate(PROMO_LINK);
  }, [safeNavigate]);

  const handleManageSubscription = useCallback(() => {
    safeNavigate(PROMO_LINK);
  }, [safeNavigate]);

  const handleRestorePurchases = useCallback(async () => {
    setRestoringPurchases(true);
    try {
      const info = await Purchases.restorePurchases();
      const hasPro = Boolean(info.entitlements.active?.pro);

      if (hasPro) {
        Alert.alert("Restored", "Your subscription has been restored.");
      } else {
        Alert.alert(
          "Nothing to restore",
          "We couldn't find past purchases for this Apple ID."
        );
      }
    } catch (error: any) {
      Alert.alert("Restore failed", error?.message ?? "Please try again.");
      console.warn("[RC] restore failed:", error);
    } finally {
      setRestoringPurchases(false);
    }
  }, []);

  // Don't render section if verifying subscription
  if (isVerifyingSubscription) {
    return null;
  }

  return (
    <View style={styles.section}>
      <AppText role="Caption" color="secondary" style={styles.sectionHeader}>
        SUBSCRIPTION
      </AppText>
      <View style={styles.sectionGroup}>
        <SettingRow
          icon={isPro ? BadgeCheck : Crown}
          title={isPro ? "Manage Subscription" : "Upgrade to Pro"}
          subtitle={
            isPro
              ? cancellationDescription
              : "Smart suggestions, deeper insights, priority AI."
          }
          accessory="chevron"
          onPress={isPro ? handleManageSubscription : handleShowPaywall}
          backgroundColor={colors.secondaryBackground}
          hapticIntensity="light"
        />
        {!isPro && (
          <>
            <View style={styles.separator} />
            <SettingRow
              icon={RotateCcw}
              title="Already subscribed?"
              subtitle="Restore purchases after reinstalling the app or switching devices."
              actionButton={{
                label: isRestoringPurchases ? "Restoring..." : "Restore",
                onPress: handleRestorePurchases,
                loading: isRestoringPurchases,
              }}
              accessory="none"
              backgroundColor={colors.secondaryBackground}
            />
          </>
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.lg,
    },
    sectionHeader: {
      marginBottom: theme.spacing.sm,
      marginLeft: theme.spacing.lg,
      letterSpacing: 0.5,
    },
    sectionGroup: {
      borderRadius: theme.components.cards.cornerRadius,
      overflow: "hidden",
      backgroundColor: colors.secondaryBackground,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.subtleBorder,
      marginLeft: theme.spacing.lg + 24 + theme.spacing.md,
      marginRight: theme.spacing.lg,
    },
  });
