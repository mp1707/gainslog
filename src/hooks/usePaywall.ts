import { useCallback, useEffect, useState } from 'react';
import {
  PurchasesError,
  PURCHASES_ERROR_CODE,
  PurchasesPackage,
} from 'react-native-purchases';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

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
  periodDescription: string;
  package: PurchasesPackage;
};

type ActionResult =
  | { status: 'ok' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

type PackageLabelKey =
  | 'annual'
  | 'monthly'
  | 'lifetime'
  | 'sixMonths'
  | 'threeMonths'
  | 'twoMonths'
  | 'weekly';

type PeriodLabelKey =
  | 'annual'
  | 'monthly'
  | 'sixMonths'
  | 'threeMonths'
  | 'twoMonths'
  | 'weekly'
  | 'oneTime';

const PACKAGE_LABEL_KEY_MAP: Record<string, PackageLabelKey | undefined> = {
  ANNUAL: 'annual',
  MONTHLY: 'monthly',
  LIFETIME: 'lifetime',
  SIX_MONTH: 'sixMonths',
  THREE_MONTH: 'threeMonths',
  TWO_MONTH: 'twoMonths',
  WEEKLY: 'weekly',
};

const PERIOD_LABEL_KEY_MAP: Record<string, PeriodLabelKey | undefined> = {
  ANNUAL: 'annual',
  MONTHLY: 'monthly',
  LIFETIME: 'oneTime',
  SIX_MONTH: 'sixMonths',
  THREE_MONTH: 'threeMonths',
  TWO_MONTH: 'twoMonths',
  WEEKLY: 'weekly',
};

const getPackageTitle = (pkg: PurchasesPackage, t: TFunction) => {
  const labelKey = PACKAGE_LABEL_KEY_MAP[pkg.packageType];
  if (labelKey) {
    return t(`paywall.options.labels.${labelKey}`);
  }

  return pkg.product.title ?? pkg.identifier;
};

const getPeriodDescription = (pkg: PurchasesPackage, t: TFunction) => {
  const periodKey = PERIOD_LABEL_KEY_MAP[pkg.packageType];
  if (!periodKey) {
    return t('paywall.options.period.cancelAnytime');
  }

  if (periodKey === 'oneTime') {
    return t('paywall.options.period.oneTime');
  }

  const periodLabel = t(`paywall.options.period.${periodKey}`);
  return t('paywall.options.period.recurring', { period: periodLabel });
};

const toOption = (pkg: PurchasesPackage, t: TFunction): PaywallOption => {
  return {
    id: pkg.identifier,
    title: getPackageTitle(pkg, t),
    price: pkg.product.priceString,
    periodDescription: getPeriodDescription(pkg, t),
    package: pkg,
  };
};

const isPurchasesError = (error: unknown): error is PurchasesError => {
  return Boolean(error) && typeof error === 'object' && 'code' in (error as any);
};

const toErrorMessage = (error: unknown, t: TFunction): string => {
  if (isPurchasesError(error) && error.message) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return t('paywall.errors.generic');
};

export const usePaywall = () => {
  const { t } = useTranslation();
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
      const mapped = packages.map((pkg) => toOption(pkg, t));

      setOptions(mapped);
      setSelectedId((current) => (
        current && mapped.some((option) => option.id === current)
          ? current
          : mapped[0]?.id ?? null
      ));
    } catch (error) {
      setLoadError(toErrorMessage(error, t));
      setOptions([]);
      setSelectedId(null);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const selectOption = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const purchase = useCallback(async (): Promise<ActionResult> => {
    if (!selectedId) {
      return { status: 'error', message: t('paywall.errors.noSelection') };
    }

    const option = options.find((item) => item.id === selectedId);
    if (!option) {
      return {
        status: 'error',
        message: t('paywall.errors.planUnavailable'),
      };
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

      return { status: 'error', message: toErrorMessage(error, t) };
    } finally {
      setIsPurchasing(false);
    }
  }, [isPurchasing, options, selectedId, t]);

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
          message: t('paywall.errors.noSubscription'),
        };
      }

      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: toErrorMessage(error, t) };
    } finally {
      setIsRestoring(false);
    }
  }, [isRestoring, t]);

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
