import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Purchases, {
  PurchasesError,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import { Check, X } from "lucide-react-native";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { RoundButton } from "@/components/shared/RoundButton";
import { useSafeRouter } from "@/hooks/useSafeRouter";
import { Colors, Theme, useTheme } from "@/theme";

type PurchaseStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string }
  | { type: "cancelled"; message: string };

const FEATURE_BULLETS = [
  "Unlimited macro logging and insights",
  "AI-powered meal analysis with faster updates",
  "Early access to premium experiments and tools",
];

export default function PaywallScreen() {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);
  const router = useSafeRouter();

  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(
    null
  );
  const [offeringsError, setOfferingsError] = useState<string | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>({
    type: "idle",
  });
  const [isTrialEligible, setIsTrialEligible] = useState(false);

  const handleClose = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const loadOfferings = async () => {
      setIsLoadingOfferings(true);
      setOfferingsError(null);
      setIsTrialEligible(false);

      try {
        const offerings: PurchasesOfferings = await Purchases.getOfferings();

        if (!isMounted) {
          return;
        }

        const pkg =
          offerings.current?.monthly ??
          offerings.current?.availablePackages[0] ??
          null;

        if (pkg) {
          setSelectedPackage(pkg);
        } else {
          setOfferingsError("MacroLoop Pro is currently unavailable. Please try again later.");
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setOfferingsError("We couldn't load the subscription details. Please try again.");
      } finally {
        if (isMounted) {
          setIsLoadingOfferings(false);
        }
      }
    };

    loadOfferings();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const evaluateEligibility = async () => {
      if (!selectedPackage?.product.identifier || Platform.OS !== "ios") {
        if (isMounted) {
          setIsTrialEligible(false);
        }
        return;
      }

      try {
        const eligibilityMap =
          await Purchases.checkTrialOrIntroductoryPriceEligibility([
            selectedPackage.product.identifier,
          ]);

        if (!isMounted) {
          return;
        }

        const eligibility = eligibilityMap[selectedPackage.product.identifier];
        const eligible =
          eligibility?.status ===
          Purchases.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;

        setIsTrialEligible(eligible);
      } catch (error) {
        if (isMounted) {
          setIsTrialEligible(false);
        }
      }
    };

    evaluateEligibility();

    return () => {
      isMounted = false;
    };
  }, [selectedPackage]);

  const handleSubscribe = useCallback(async () => {
    if (!selectedPackage) {
      return;
    }

    setPurchaseStatus({ type: "loading" });

    try {
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      if (typeof customerInfo.entitlements.active["pro"] !== "undefined") {
        setPurchaseStatus({
          type: "success",
          message: "You're all set! MacroLoop Pro is now active.",
        });
      } else {
        setPurchaseStatus({
          type: "success",
          message: "Purchase completed. Your benefits will unlock shortly.",
        });
      }
    } catch (error) {
      const purchasesError = error as PurchasesError & { userCancelled?: boolean };

      if (purchasesError?.userCancelled) {
        setPurchaseStatus({
          type: "cancelled",
          message: "Purchase cancelled. No worries—come back anytime.",
        });
        return;
      }

      setPurchaseStatus({
        type: "error",
        message: "We couldn't complete the purchase. Please try again.",
      });
    }
  }, [selectedPackage]);

  const renderContent = () => {
    if (isLoadingOfferings) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.accent} />
          <AppText role="Caption" color="secondary" style={styles.loadingLabel}>
            Fetching MacroLoop Pro details…
          </AppText>
        </View>
      );
    }

    if (offeringsError) {
      return (
        <View style={styles.messageContainer}>
          <AppText role="Subhead" color="secondary" style={styles.centerText}>
            {offeringsError}
          </AppText>
          <Button
            variant="secondary"
            label="Try again"
            onPress={() => {
              setPurchaseStatus({ type: "idle" });
              setOfferingsError(null);
              setIsLoadingOfferings(true);
              setIsTrialEligible(false);

              // Retry loading offerings
              Purchases.getOfferings()
                .then((offerings) => {
                  const pkg =
                    offerings.current?.monthly ??
                    offerings.current?.availablePackages[0] ??
                    null;

                  if (pkg) {
                    setSelectedPackage(pkg);
                    setOfferingsError(null);
                  } else {
                    setOfferingsError(
                      "MacroLoop Pro is currently unavailable. Please try again later."
                    );
                  }
                })
                .catch(() => {
                  setOfferingsError(
                    "We couldn't load the subscription details. Please try again."
                  );
                })
                .finally(() => {
                  setIsLoadingOfferings(false);
                });
            }}
          />
        </View>
      );
    }

    if (!selectedPackage) {
      return (
        <View style={styles.messageContainer}>
          <AppText role="Subhead" color="secondary" style={styles.centerText}>
            No subscription options are available right now.
          </AppText>
        </View>
      );
    }

    return (
      <>
        <View style={styles.pricePanel}>
          <AppText role="Headline" color="secondary">
            Monthly access
          </AppText>
          <AppText role="Title1" style={styles.priceText}>
            {selectedPackage.product.priceString}
          </AppText>
          <AppText role="Caption" color="secondary" style={styles.centerText}>
            Billed monthly. Cancel anytime from Settings.
          </AppText>
        </View>

        <View style={styles.featuresContainer}>
          {FEATURE_BULLETS.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Check size={18} color={colors.accent} />
              </View>
              <AppText role="Body" style={styles.featureText}>
                {feature}
              </AppText>
            </View>
          ))}
        </View>

        <Button
          variant="primary"
          label={
            isTrialEligible
              ? "Start free trial"
              : `Subscribe for ${selectedPackage.product.priceString}/month`
          }
          onPress={handleSubscribe}
          disabled={purchaseStatus.type === "loading"}
        />
      </>
    );
  };

  const renderStatusMessage = () => {
    switch (purchaseStatus.type) {
      case "success":
        return (
          <AppText role="Caption" style={[styles.statusMessage, styles.successMessage]}>
            {purchaseStatus.message}
          </AppText>
        );
      case "error":
        return (
          <AppText role="Caption" style={[styles.statusMessage, styles.errorMessage]}>
            {purchaseStatus.message}
          </AppText>
        );
      case "cancelled":
        return (
          <AppText role="Caption" style={[styles.statusMessage, styles.cancelledMessage]}>
            {purchaseStatus.message}
          </AppText>
        );
      case "loading":
        return (
          <AppText role="Caption" color="secondary" style={styles.statusMessage}>
            Processing your purchase…
          </AppText>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText role="Title2">MacroLoop Pro</AppText>
        <AppText role="Subhead" color="secondary" style={styles.headerSubtitle}>
          Unlock faster logging, AI insights, and premium experiments.
        </AppText>
      </View>

      <View style={styles.closeButton}>
        <RoundButton
          onPress={handleClose}
          Icon={X}
          variant="tertiary"
          accessibilityLabel="Close paywall"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {renderContent()}
        {renderStatusMessage()}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme, colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
      paddingTop: theme.spacing.xl,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    headerSubtitle: {
      marginTop: theme.spacing.xs,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.lg,
      right: theme.spacing.lg,
      zIndex: 10,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.xxl,
      gap: theme.spacing.sm,
    },
    loadingLabel: {
      textAlign: "center",
    },
    messageContainer: {
      alignItems: "center",
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xxl,
    },
    centerText: {
      textAlign: "center",
    },
    pricePanel: {
      backgroundColor: colors.tertiaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      alignItems: "center",
      gap: theme.spacing.sm,
      borderWidth: 1,
      borderColor: colors.subtleBorder,
    },
    priceText: {
      color: colors.primaryText,
    },
    featuresContainer: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.components.cards.cornerRadius,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: colors.subtleBorder,
      gap: theme.spacing.md,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureIcon: {
      width: 24,
      alignItems: "center",
      justifyContent: "center",
      marginRight: theme.spacing.sm,
    },
    featureText: {
      flex: 1,
    },
    statusMessage: {
      marginTop: theme.spacing.md,
      textAlign: "center",
    },
    successMessage: {
      color: colors.success,
    },
    errorMessage: {
      color: colors.error,
    },
    cancelledMessage: {
      color: colors.secondaryText,
    },
  });
