import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import Purchases, {
  PurchasesError,
  PurchasesPackage,
} from "react-native-purchases";
import { useSafeRouter } from "./useSafeRouter";

type PaywallPackage = {
  id: string;
  title: string;
  price: string;
  subText: string;
  badge?: string;
  pkg: PurchasesPackage;
};

type PaywallState = {
  packages: PaywallPackage[];
  selectedId: string | null;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
};

const formatCurrency = (value: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
};

export function usePaywall() {
  const router = useSafeRouter();
  const [state, setState] = useState<PaywallState>({
    packages: [],
    selectedId: null,
    isLoading: true,
    isPurchasing: false,
    isRestoring: false,
  });

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  // Load offerings once on mount
  useEffect(() => {
    let isMounted = true;

    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (!isMounted) return;

        const packages: PaywallPackage[] = [];

        // Annual package
        const annual = offerings.current?.annual;
        if (annual) {
          const monthlyEquivalent = annual.product.price / 12;
          packages.push({
            id: annual.identifier,
            title: "Annual",
            price: `${annual.product.priceString} / year`,
            subText: `Just ${formatCurrency(
              monthlyEquivalent,
              annual.product.currencyCode
            )} per month`,
            badge: "Best Value",
            pkg: annual,
          });
        }

        // Monthly package
        const monthly = offerings.current?.monthly;
        if (monthly) {
          packages.push({
            id: monthly.identifier,
            title: "Monthly",
            price: `${monthly.product.priceString} / month`,
            subText: "Cancel anytime from Settings",
            pkg: monthly,
          });
        }

        // Fallback to available packages if no annual/monthly
        if (
          packages.length === 0 &&
          offerings.current?.availablePackages?.length
        ) {
          offerings.current.availablePackages.forEach((pkg) => {
            packages.push({
              id: pkg.identifier,
              title: pkg.packageType,
              price: pkg.product.priceString,
              subText: "Cancel anytime",
              pkg,
            });
          });
        }

        if (isMounted) {
          setState((prev) => ({
            ...prev,
            packages,
            selectedId: packages[0]?.id ?? null,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("[Paywall] Failed to load offerings:", error);
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }));
          Alert.alert(
            "Unable to Load",
            "We couldn't load subscription options. Please try again later."
          );
        }
      }
    };

    loadOfferings();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectPackage = useCallback((packageId: string) => {
    setState((prev) => ({ ...prev, selectedId: packageId }));
  }, []);

  const purchase = useCallback(async () => {
    const selectedPackage = state.packages.find(
      (p) => p.id === state.selectedId
    );

    if (!selectedPackage || state.isPurchasing) {
      return;
    }

    setState((prev) => ({ ...prev, isPurchasing: true }));

    try {
      const { customerInfo } = await Purchases.purchasePackage(
        selectedPackage.pkg
      );

      if (customerInfo.entitlements.active["pro"]) {
        setState((prev) => ({ ...prev, isPurchasing: false }));
        handleClose();
      }
    } catch (error) {
      const purchasesError = error as PurchasesError & {
        userCancelled?: boolean;
      };

      if (!purchasesError?.userCancelled) {
        Alert.alert(
          "Purchase Failed",
          "We couldn't complete the purchase. Please try again.",
          [{ text: "OK", style: "default" }]
        );
      }
    }
    setState((prev) => ({ ...prev, isPurchasing: false }));
  }, [state.packages, state.selectedId, state.isPurchasing]);

  const restore = useCallback(async () => {
    if (state.isRestoring) {
      return;
    }

    setState((prev) => ({ ...prev, isRestoring: true }));

    try {
      const info = await Purchases.restorePurchases();
      const hasPro = Boolean(info.entitlements.active?.pro);

      if (hasPro) {
        Alert.alert("Restored", "Your subscription has been restored.", [
          { text: "OK", style: "default" },
        ]);
      } else {
        Alert.alert(
          "Nothing to Restore",
          "We couldn't find any past purchases for this Apple ID.",
          [{ text: "OK", style: "default" }]
        );
      }
    } catch (error: any) {
      Alert.alert("Restore Failed", error?.message ?? "Please try again.", [
        { text: "OK", style: "default" },
      ]);
    }
    setState((prev) => ({ ...prev, isRestoring: false }));
  }, [state.isRestoring]);

  return {
    packages: state.packages,
    selectedId: state.selectedId,
    isLoading: state.isLoading,
    isPurchasing: state.isPurchasing,
    isRestoring: state.isRestoring,
    selectPackage,
    purchase,
    restore,
  };
}
