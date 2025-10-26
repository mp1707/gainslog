import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import Purchases, { CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

import { useAppStore } from '@/store/useAppStore';

// Heartbeat interval: 15 minutes in milliseconds
const HEARTBEAT_INTERVAL = 15 * 60 * 1000;

export function useRevenueCatBindings() {
  const listenerRef = useRef<((info: CustomerInfo) => void) | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef<boolean>(false);

  // Define updateSubscriptionState using useCallback to ensure stable reference
  const updateSubscriptionState = useCallback((info: CustomerInfo) => {
    console.log('[RC] updateSubscriptionState called');

    // Get store methods directly to avoid closure issues
    const { setPro, setProMetadata } = useAppStore.getState();

    const activePro = info.entitlements.active?.pro;

    // Log detailed entitlement info for debugging
    console.log('[RC] Full entitlement info:', {
      hasActivePro: !!activePro,
      willRenew: activePro?.willRenew,
      unsubscribeDetectedAt: activePro?.unsubscribeDetectedAt,
      billingIssueDetectedAt: activePro?.billingIssueDetectedAt,
      expirationDate: activePro?.expirationDate,
    });

    if (!activePro) {
      console.log('[RC] No active Pro entitlement found - setting isPro to FALSE');
      setPro(false);
      setProMetadata({ isCanceled: false, expirationDate: undefined });

      // Verify the store was updated
      const currentState = useAppStore.getState();
      console.log('[RC] Store state after update:', {
        isPro: currentState.isPro,
        isProCanceled: currentState.isProCanceled,
      });
      return;
    }

    const expirationDate = activePro.expirationDate ?? undefined;

    // Check if subscription has expired (manual safety check)
    if (expirationDate) {
      const expirationTime = new Date(expirationDate).getTime();
      const now = Date.now();
      const isExpired = now > expirationTime;

      if (isExpired) {
        console.log('[RC] Subscription expired at', expirationDate, '- setting isPro to FALSE');
        setPro(false);
        setProMetadata({ isCanceled: false, expirationDate: undefined });

        // Verify the store was updated
        const currentState = useAppStore.getState();
        console.log('[RC] Store state after expiration:', {
          isPro: currentState.isPro,
          isProCanceled: currentState.isProCanceled,
        });
        return;
      }
    }

    // User has active, non-expired Pro subscription
    const hasPro = true;

    // Check if auto-renew is turned off (subscription is canceled but still active)
    // willRenew is the canonical field for this
    const willRenew = activePro.willRenew ?? true;
    const isCanceled = !willRenew;

    console.log('[RC] Pro subscription active - setting isPro to TRUE', {
      willRenew,
      isCanceled,
      expirationDate,
    });

    setPro(hasPro);
    setProMetadata({ isCanceled, expirationDate });

    // Verify the store was updated
    const currentState = useAppStore.getState();
    console.log('[RC] Store state after update:', {
      isPro: currentState.isPro,
      isProCanceled: currentState.isProCanceled,
      proExpirationDate: currentState.proExpirationDate,
    });
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) {
      console.log('[RC] Check already in progress, skipping');
      return;
    }

    isCheckingRef.current = true;

    try {
      console.log('[RC] Fetching customer info from RevenueCat...');
      const info = await Purchases.getCustomerInfo();
      console.log('[RC] Customer info received, updating state...');
      updateSubscriptionState(info);
    } catch (error) {
      console.warn('[RC] refreshCustomerInfo failed', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [updateSubscriptionState]);

  const startHeartbeat = useCallback(() => {
    // Clear any existing timer first
    if (heartbeatTimerRef.current) {
      console.log('[RC] Clearing existing heartbeat timer');
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    console.log('[RC] Starting heartbeat timer (every 15 minutes)');
    heartbeatTimerRef.current = setInterval(() => {
      console.log('[RC] Heartbeat - checking subscription status');
      void refreshCustomerInfo();
    }, HEARTBEAT_INTERVAL);
  }, [refreshCustomerInfo]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      console.log('[RC] Stopping heartbeat timer');
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

    Purchases.setLogLevel(LOG_LEVEL.INFO);

    if (!apiKey) {
      console.warn('[RC] Missing EXPO_PUBLIC_REVENUECAT_IOS_KEY; RevenueCat disabled.');
      return;
    }

    Purchases.configure({ apiKey });
    console.log('[RC] RevenueCat configured');

    // Initial check on app launch
    console.log('[RC] Performing initial subscription check...');
    void refreshCustomerInfo();

    // Set up customer info update listener
    listenerRef.current = (info) => {
      console.log('[RC] Customer info updated via listener');
      updateSubscriptionState(info);
    };

    Purchases.addCustomerInfoUpdateListener(listenerRef.current);

    // Start heartbeat timer after initial setup
    startHeartbeat();

    // Listen to app state changes
    const appStateSub = AppState.addEventListener('change', async (state) => {
      if (state === 'active') {
        console.log('[RC] App foregrounded - checking subscription');
        await refreshCustomerInfo();
        // Restart heartbeat after foreground check
        startHeartbeat();
      } else if (state === 'background' || state === 'inactive') {
        console.log('[RC] App backgrounded - stopping heartbeat');
        stopHeartbeat();
      }
    });

    return () => {
      console.log('[RC] Cleaning up RevenueCat bindings');
      stopHeartbeat();

      if (listenerRef.current) {
        Purchases.removeCustomerInfoUpdateListener(listenerRef.current);
      }

      appStateSub.remove();
    };
  }, [refreshCustomerInfo, updateSubscriptionState, startHeartbeat, stopHeartbeat]);

  return { refreshCustomerInfo };
}
