import { CustomerInfo } from 'react-native-purchases';

import { useAppStore } from '@/store/useAppStore';

type Snapshot = {
  isPro: boolean;
  isCanceled: boolean;
  expirationDate?: string | null;
};

const toSnapshot = (info: CustomerInfo): Snapshot => {
  const entitlement = info.entitlements.active?.pro;

  if (!entitlement) {
    return {
      isPro: false,
      isCanceled: false,
      expirationDate: undefined,
    };
  }

  const willRenew = entitlement.willRenew ?? true;

  return {
    isPro: true,
    isCanceled: !willRenew,
    expirationDate: entitlement.expirationDate ?? null,
  };
};

export const applyCustomerInfoToStore = (info: CustomerInfo) => {
  const snapshot = toSnapshot(info);
  const { setPro, setProMetadata } = useAppStore.getState();

  setPro(snapshot.isPro);
  setProMetadata({
    isCanceled: snapshot.isCanceled,
    expirationDate: snapshot.expirationDate ?? undefined,
  });
};
