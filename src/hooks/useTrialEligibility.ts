import { useEffect, useState } from "react";
import { Platform } from "react-native";
import Purchases, {
  INTRO_ELIGIBILITY_STATUS,
  PurchasesPackage,
} from "react-native-purchases";

export type TrialInfo = {
  eligible: boolean;
  days: number;
};

type TrialEligibilityMap = Record<string, TrialInfo | null>;

// App Store trial configuration is 7 days. Use this when RevenueCat doesn't expose duration metadata.
const FALLBACK_TRIAL_DAYS = 7;

/**
 * Hook to check trial eligibility for RevenueCat products.
 * iOS only - Android always returns UNKNOWN status, so we don't show trial info.
 *
 * @param packages - Array of RevenueCat packages to check
 * @returns Map of product IDs to trial info (null if ineligible or unavailable)
 */
export function useTrialEligibility(
  packages: PurchasesPackage[]
): TrialEligibilityMap {
  const [eligibilityMap, setEligibilityMap] = useState<TrialEligibilityMap>(
    {}
  );

  useEffect(() => {
    // Only check on iOS - Android always returns UNKNOWN
    if (Platform.OS !== "ios") {
      setEligibilityMap({});
      return;
    }

    if (packages.length === 0) {
      setEligibilityMap({});
      return;
    }

    let mounted = true;

    const checkEligibility = async () => {
      try {
        // Extract all product identifiers
        const productIds = packages.map(
          (pkg) => pkg.product.identifier
        );

        // Check eligibility for all products at once (single API call)
        const eligibilityResults =
          await Purchases.checkTrialOrIntroductoryPriceEligibility(productIds);

        if (!mounted) return;

        // Build eligibility map
        const map: TrialEligibilityMap = {};

        packages.forEach((pkg) => {
          const productId = pkg.product.identifier;
          const eligibilityStatus = eligibilityResults[productId];
          const trialPeriod = getFreeTrialPeriod(pkg);

          const isEligible =
            eligibilityStatus?.status ===
            INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
          const isUnknown =
            eligibilityStatus?.status ===
              INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_UNKNOWN ||
            !eligibilityStatus;
          const canInferTrial = Boolean(trialPeriod);

          const shouldShowTrial =
            isEligible || (isUnknown && canInferTrial);

          if (shouldShowTrial) {
            const days = trialPeriod
              ? convertPeriodToDays(trialPeriod)
              : FALLBACK_TRIAL_DAYS;
            map[productId] = {
              eligible: isEligible,
              days,
            };
          } else {
            map[productId] = null;
          }
        });

        setEligibilityMap(map);
      } catch (error) {
        if (!mounted) return;

        // Optimistic fallback on error: If product exposes a free trial period, show it
        const fallbackMap: TrialEligibilityMap = {};

        packages.forEach((pkg) => {
          const productId = pkg.product.identifier;
          const trialPeriod = getFreeTrialPeriod(pkg);

          if (trialPeriod) {
            const days = convertPeriodToDays(trialPeriod);
            fallbackMap[productId] = {
              eligible: false, // Unknown eligibility
              days,
            };
          } else {
            fallbackMap[productId] = null;
          }
        });

        setEligibilityMap(fallbackMap);

        if (__DEV__) {
          console.warn("Trial eligibility check failed:", error);
        }
      }
    };

    checkEligibility();

    return () => {
      mounted = false;
    };
  }, [packages]);

  return eligibilityMap;
}

/**
 * Convert ISO 8601 period string to number of days
 * Examples:
 * - "P7D" -> 7 days
 * - "P1W" -> 7 days
 * - "P1M" -> 30 days
 * - "P3M" -> 90 days
 */
function convertPeriodToDays(period: string): number {
  // Remove 'P' prefix
  const value = period.slice(1);

  // Parse the number and unit
  const match = value.match(/^(\d+)([DWMY])$/);
  if (!match) {
    if (__DEV__) {
      console.warn(`Unknown period format: ${period}, defaulting to 7 days`);
    }
    return 7; // Default fallback
  }

  const [, numStr, unit] = match;
  const num = parseInt(numStr, 10);

  switch (unit) {
    case "D": // Days
      return num;
    case "W": // Weeks
      return num * 7;
    case "M": // Months (approximate)
      return num * 30;
    case "Y": // Years (approximate)
      return num * 365;
    default:
      return 7; // Default fallback
  }
}

function getFreeTrialPeriod(pkg: PurchasesPackage): string | null {
  const introPrice = pkg.product.introPrice;
  if (introPrice && introPrice.price === 0) {
    return introPrice.period;
  }

  const discountWithFreePrice = pkg.product.discounts?.find(
    (discount) => discount.price === 0 && Boolean(discount.period)
  );
  if (discountWithFreePrice?.period) {
    return discountWithFreePrice.period;
  }

  const subscriptionOptions = pkg.product.subscriptionOptions;
  if (subscriptionOptions) {
    for (const option of subscriptionOptions) {
      const freePhaseIso =
        option.freePhase?.billingPeriod?.iso8601 ??
        option.pricingPhases
          .find((phase) => phase.price.amountMicros === 0)
          ?.billingPeriod?.iso8601;

      if (freePhaseIso) {
        return freePhaseIso;
      }
    }
  }

  return null;
}
