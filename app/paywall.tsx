import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  BadgeCheck,
  BrainCircuit,
  BrushCleaning,
  Calculator,
  Heart,
  X,
} from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { RoundButton } from "@/components/shared/RoundButton";
import { usePaywall } from "@/hooks/usePaywall";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { Colors, Theme, useTheme } from "@/theme";

const FEATURES = [
  {
    title: "AI-Powered Logging",
    description:
      "Log meals instantly from text, voice, or a photo. No more searching for ingredients.",
    Icon: BrainCircuit,
  },
  {
    title: "Instant Recalculation",
    description:
      "Adjust ingredients and get immediate macro updates to fine-tune your meals.",
    Icon: Calculator,
  },
  {
    title: "No Ads. Period.",
    description: "Support ad-free development",
    Icon: Heart,
  },
] as const;

const LEGAL_TEXT = "";
// "Payment will be charged to your Apple ID account at confirmation of purchase. Subscription renews automatically unless cancelled at least 24 hours before the end of the billing period. ";

export default function PaywallScreen() {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);
  const router = useSafeRouter();

  const {
    packages,
    selectedId,
    isLoading,
    isPurchasing,
    isRestoring,
    selectPackage,
    purchase,
    restore,
  } = usePaywall();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleSelectPackage = (id: string) => {
    selectPackage(id);
    Haptics.impactAsync(theme.interactions.haptics.light).catch(() => {});
  };

  const handlePurchase = () => {
    Haptics.impactAsync(theme.interactions.haptics.light).catch(() => {});
    purchase();
  };

  const handleRestore = () => {
    Haptics.impactAsync(theme.interactions.haptics.light).catch(() => {});
    restore();
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <RoundButton
          onPress={handleClose}
          Icon={X}
          variant="tertiary"
          accessibilityLabel="Close paywall"
          style={styles.closeButton}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <AppText role="Caption" color="secondary">
            Loading Pro details…
          </AppText>
        </View>
      </View>
    );
  }

  // No packages available
  if (packages.length === 0) {
    return (
      <View style={styles.container}>
        <RoundButton
          onPress={handleClose}
          Icon={X}
          variant="tertiary"
          accessibilityLabel="Close paywall"
          style={styles.closeButton}
        />
        <View style={styles.errorContainer}>
          <AppText role="Subhead" color="secondary">
            Macroloop Pro is currently unavailable. Please try again later.
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <RoundButton
        onPress={handleClose}
        Icon={X}
        variant="tertiary"
        accessibilityLabel="Close paywall"
        style={styles.closeButton}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText role="Title1" style={styles.title}>
            MacroLoop Pro
          </AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            Save time and stay consistent with effortless AI powered tracking.
          </AppText>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map(({ Icon, title, description }) => (
            <View key={title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Icon size={22} color={colors.accent} />
              </View>
              <View style={styles.featureText}>
                <AppText role="Headline">{title}</AppText>
                <AppText role="Caption" color="secondary">
                  {description}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {/* Package options */}
        <View style={styles.packages}>
          {packages.map((pkg) => {
            const isSelected = pkg.id === selectedId;
            return (
              <TouchableOpacity
                key={pkg.id}
                activeOpacity={0.7}
                onPress={() => handleSelectPackage(pkg.id)}
                style={[
                  styles.package,
                  isSelected && styles.packageSelected,
                  pkg.badge && styles.packageHighlighted,
                ]}
              >
                <View style={styles.packageHeader}>
                  <AppText role="Headline">{pkg.title}</AppText>
                  {pkg.badge && (
                    <View style={styles.badge}>
                      <AppText role="Caption" style={styles.badgeText}>
                        {pkg.badge}
                      </AppText>
                    </View>
                  )}
                </View>
                <AppText role="Title2">{pkg.price}</AppText>
                <AppText role="Caption" color="secondary">
                  {pkg.subText}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CTA */}
        <Button
          variant="primary"
          label={isPurchasing ? "Processing…" : "Unlock Pro"}
          onPress={handlePurchase}
          disabled={isPurchasing || !selectedId}
          isLoading={isPurchasing}
        />

        {/* Legal */}
        <View style={styles.legal}>
          {LEGAL_TEXT.length > 0 && (
            <AppText role="Caption" color="secondary" style={styles.legalText}>
              {LEGAL_TEXT}
            </AppText>
          )}
          <View style={styles.links}>
            <TouchableOpacity
              onPress={() =>
                handleOpenLink(
                  "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                )
              }
              activeOpacity={0.6}
            >
              <AppText role="Caption" style={styles.link}>
                Terms of Use
              </AppText>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity
              onPress={() => handleOpenLink("https://macroloop.app/privacy")}
              activeOpacity={0.6}
            >
              <AppText role="Caption" style={styles.link}>
                Privacy Policy
              </AppText>
            </TouchableOpacity>
            <View style={styles.linkDivider} />
            <TouchableOpacity
              onPress={handleRestore}
              disabled={isRestoring}
              activeOpacity={0.6}
            >
              <AppText
                role="Caption"
                style={[styles.link, isRestoring && styles.linkDisabled]}
              >
                {isRestoring ? "Restoring…" : "Restore Purchases"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const createStyles = (theme: Theme, colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.secondaryBackground,
      paddingTop: theme.spacing.xxl + theme.spacing.lg,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 10,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    errorContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    header: {
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    title: {
      textAlign: "center",
    },
    subtitle: {
      textAlign: "center",
    },
    features: {
      gap: theme.spacing.lg,
    },
    feature: {
      flexDirection: "row",
      gap: theme.spacing.md,
      alignItems: "flex-start",
    },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.tertiaryBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    featureText: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    packages: {
      gap: theme.spacing.md,
    },
    package: {
      borderWidth: 1,
      borderColor: colors.subtleBorder,
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.lg,
      backgroundColor: colors.tertiaryBackground,
      gap: theme.spacing.sm,
    },
    packageSelected: {
      borderColor: colors.accent,
      backgroundColor: "rgba(68, 235, 212, 0.08)",
    },
    packageHighlighted: {
      borderColor: colors.highlightBorder,
    },
    packageHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    badge: {
      backgroundColor: colors.accent,
      borderRadius: theme.components.buttons.cornerRadius,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    badgeText: {
      color: colors.black,
    },
    legal: {
      gap: theme.spacing.sm,
      alignItems: "center",
      marginTop: theme.spacing.md,
    },
    legalText: {
      textAlign: "center",
    },
    links: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: theme.spacing.sm,
    },
    linkDivider: {
      width: 1,
      height: 14,
      backgroundColor: colors.subtleBorder,
    },
    link: {
      color: colors.accent,
    },
    linkDisabled: {
      color: colors.disabledText,
    },
  });
