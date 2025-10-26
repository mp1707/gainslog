import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

import { useAppStore } from '@/store/useAppStore';

export function useRevenueCatBindings() {
  const setPro = useAppStore((state) => state.setPro);
  const listenerRef = useRef<((info: CustomerInfo) => void) | null>(null);

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

    Purchases.setLogLevel(LOG_LEVEL.INFO);

    if (!apiKey) {
      console.warn('[RC] Missing EXPO_PUBLIC_REVENUECAT_IOS_KEY; RevenueCat disabled.');
      return;
    }

    Purchases.configure({ apiKey });

    void refreshCustomerInfo();

    listenerRef.current = (info) => {
      const hasPro = Boolean(info.entitlements.active?.pro);
      setPro(hasPro);
    };

    Purchases.addCustomerInfoUpdateListener(listenerRef.current);

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshCustomerInfo();
      }
    });

    return () => {
      if (listenerRef.current) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
      }

      appStateSub.remove();
    };
  }, [setPro]);

  async function refreshCustomerInfo() {
    try {
      const info = await Purchases.getCustomerInfo();
      const hasPro = Boolean(info.entitlements.active?.pro);
      setPro(hasPro);
    } catch (error) {
      console.warn('[RC] refreshCustomerInfo failed', error);
    }
  }

  return { refreshCustomerInfo };
}
