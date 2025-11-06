import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  addCustomerInfoListener,
  ensureRevenueCatConfigured,
  getCustomerInfo,
} from '@/lib/revenuecat/client';
import { applyCustomerInfoToStore } from '@/lib/revenuecat/subscription';
import { useAppStore } from '@/store/useAppStore';

export const useRevenueCat = () => {
  const setVerifyingSubscription = useAppStore(
    (state) => state.setVerifyingSubscription,
  );

  useEffect(() => {
    if (!ensureRevenueCatConfigured()) {
      setVerifyingSubscription(false);
      return;
    }

    let isMounted = true;

    const loadCustomer = async () => {
      setVerifyingSubscription(true);
      try {
        const info = await getCustomerInfo();
        if (isMounted) {
          applyCustomerInfoToStore(info);
        }
      } catch (error) {
        console.warn('[RevenueCat] Failed to fetch customer info', error);
      } finally {
        if (isMounted) {
          setVerifyingSubscription(false);
        }
      }
    };

    void loadCustomer();

    const removeListener = addCustomerInfoListener(applyCustomerInfoToStore);

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void loadCustomer();
      }
    });

    return () => {
      isMounted = false;
      setVerifyingSubscription(false);
      removeListener();
      appStateSubscription.remove();
    };
  }, [setVerifyingSubscription]);
};
