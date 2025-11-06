import { useCallback, useEffect, useState } from 'react';
import {
  PurchasesError,
  PURCHASES_ERROR_CODE,
  PurchasesPackage,
} from 'react-native-purchases';

import {
  fetchCurrentPackages,
  purchasePackage,
  restorePurchases,
} from '@/lib/revenuecat/client';
import { applyCustomerInfoToStore } from '@/lib/revenuecat/subscription';

export type PaywallOption = {
  id: string;
  title: string;
  price: string;
  periodLabel: string;
  package: PurchasesPackage;
};

type ActionResult =
  | { status: 'ok' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

const PACKAGE_LABEL_MAP: Record<string, string> = {
  ANNUAL: 'Annual',
  MONTHLY: 'Monthly',
  LIFETIME: 'Lifetime',
  SIX_MONTH: '6 Months',
  THREE_MONTH: '3 Months',
  TWO_MONTH: '2 Months',
  WEEKLY: 'Weekly',
};

const PERIOD_LABEL_MAP: Record<string, string> = {
  ANNUAL: 'per year',
  MONTHLY: 'per month',
  LIFETIME: 'one-time',
  SIX_MONTH: 'per 6 months',
  THREE_MONTH: 'per 3 months',
  TWO_MONTH: 'per 2 months',
  WEEKLY: 'per week',
};

const toOption = (pkg: PurchasesPackage): PaywallOption => {
  const title =
    PACKAGE_LABEL_MAP[pkg.packageType] ?? pkg.product.title ?? pkg.identifier;
  const periodLabel = PERIOD_LABEL_MAP[pkg.packageType] ?? '';

  return {
    id: pkg.identifier,
    title,
    price: pkg.product.priceString,
    periodLabel,
    package: pkg,
  };
};

const isPurchasesError = (error: unknown): error is PurchasesError => {
  return Boolean(error) && typeof error === 'object' && 'code' in (error as any);
};

const toErrorMessage = (error: unknown): string => {
  if (isPurchasesError(error) && error.message) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

export const usePaywall = () => {
  const [options, setOptions] = useState<PaywallOption[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const packages = await fetchCurrentPackages();
      const mapped = packages.map(toOption);

      setOptions(mapped);
      setSelectedId((current) => (
        current && mapped.some((option) => option.id === current)
          ? current
          : mapped[0]?.id ?? null
      ));
    } catch (error) {
      setLoadError(toErrorMessage(error));
      setOptions([]);
      setSelectedId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const selectOption = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const purchase = useCallback(async (): Promise<ActionResult> => {
    if (!selectedId) {
      return { status: 'error', message: 'Please choose a plan.' };
    }

    const option = options.find((item) => item.id === selectedId);
    if (!option) {
      return { status: 'error', message: 'Selected plan is no longer available.' };
    }

    if (isPurchasing) {
      return { status: 'cancelled' };
    }

    setIsPurchasing(true);
    try {
      const info = await purchasePackage(option.package);
      applyCustomerInfoToStore(info);
      return { status: 'ok' };
    } catch (error) {
      if (isPurchasesError(error)) {
        if (
          error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR ||
          error.code === PURCHASES_ERROR_CODE.OPERATION_ALREADY_IN_PROGRESS_ERROR
        ) {
          return { status: 'cancelled' };
        }
      }

      return { status: 'error', message: toErrorMessage(error) };
    } finally {
      setIsPurchasing(false);
    }
  }, [isPurchasing, options, selectedId]);

  const restore = useCallback(async (): Promise<ActionResult> => {
    if (isRestoring) {
      return { status: 'cancelled' };
    }

    setIsRestoring(true);
    try {
      const info = await restorePurchases();
      applyCustomerInfoToStore(info);

      const hasPro = Boolean(info.entitlements.active?.pro);
      if (!hasPro) {
        return {
          status: 'error',
          message: "We couldn't find a subscription for this Apple ID.",
        };
      }

      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: toErrorMessage(error) };
    } finally {
      setIsRestoring(false);
    }
  }, [isRestoring]);

  return {
    options,
    selectedId,
    isLoading,
    loadError,
    isPurchasing,
    isRestoring,
    selectOption,
    reload: loadOptions,
    purchase,
    restore,
  };
};
