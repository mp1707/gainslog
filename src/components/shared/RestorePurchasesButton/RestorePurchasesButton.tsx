import React, { useCallback, useMemo, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import Purchases from "react-native-purchases";

import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button";
import { useTheme } from "@/theme";

interface RestorePurchasesButtonProps {
  /**
   * Optional callback invoked after a successful restore
   */
  onRestoreSuccess?: () => void;
}

export const RestorePurchasesButton: React.FC<RestorePurchasesButtonProps> = ({
  onRestoreSuccess,
}) => {
  const { colors, theme } = useTheme();
  const [isRestoring, setIsRestoring] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          gap: theme.spacing.sm,
        },
        microcopy: {
          textAlign: "center",
        },
      }),
    [theme]
  );

  const handleRestore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      const hasPro = Boolean(info.entitlements.active?.pro);

      if (hasPro) {
        Alert.alert(
          "Restored",
          "Your subscription has been restored.",
          [{ text: "OK", style: "default" }],
          { cancelable: true }
        );
        onRestoreSuccess?.();
      } else {
        Alert.alert(
          "Nothing to restore",
          "We couldn't find any past purchases for this Apple ID.",
          [{ text: "OK", style: "default" }],
          { cancelable: true }
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Restore failed",
        error?.message ?? "Please try again.",
        [{ text: "OK", style: "default" }],
        { cancelable: true }
      );
      console.warn("[RC] restore failed:", error);
    } finally {
      setIsRestoring(false);
    }
  }, [onRestoreSuccess]);

  return (
    <View style={styles.container}>
      <AppText role="Caption" color="secondary" style={styles.microcopy}>
        Restores your subscription purchased with this Apple ID. You won't be
        charged.
      </AppText>
      <Button
        label={isRestoring ? "Restoring..." : "Restore Purchases"}
        variant="tertiary"
        onPress={handleRestore}
        disabled={isRestoring}
        accessibilityLabel="Restore purchases"
        accessibilityHint="Restores your subscription if you've already purchased"
        accessibilityState={{ busy: isRestoring }}
      />
    </View>
  );
};
