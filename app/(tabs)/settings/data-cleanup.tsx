import React, { useMemo, useState, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import { RadioCard } from "@/components/shared/RadioCard/RadioCard";
import { AppText, Button } from "@/components";
import { useTheme, Colors, Theme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";

interface RetentionOption {
  value: number | null;
  label: string;
  days: number | null;
}

export default function DataCleanupScreen() {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const [selectedDays, setSelectedDays] = useState<number | null>(90);
  const [isDeleting, setIsDeleting] = useState(false);

  const { foodLogs, pruneOldLogs } = useAppStore();

  // Calculate counts for each retention period
  const getCountForDays = useCallback(
    (days: number | null): number => {
      if (days === null) {
        return foodLogs.length; // All logs
      }

      const today = new Date();
      const cutoffDate = new Date(today);
      cutoffDate.setDate(today.getDate() - days);
      const cutoffString = cutoffDate.toISOString().split("T")[0];

      return foodLogs.filter((log) => log.logDate < cutoffString).length;
    },
    [foodLogs]
  );

  const logsToDeleteCount = useMemo(
    () => getCountForDays(selectedDays),
    [selectedDays, getCountForDays]
  );

  const retentionOptions: RetentionOption[] = useMemo(
    () => [
      {
        value: 30,
        label: t("settings.dataCleanup.options.30days"),
        days: 30,
      },
      {
        value: 90,
        label: t("settings.dataCleanup.options.90days"),
        days: 90,
      },
      {
        value: 180,
        label: t("settings.dataCleanup.options.180days"),
        days: 180,
      },
      {
        value: null,
        label: t("settings.dataCleanup.options.all"),
        days: null,
      },
    ],
    [t]
  );

  const handleSelectRetention = (days: number | null) => {
    if (days === selectedDays) {
      return;
    }
    setSelectedDays(days);
  };

  const handleDeleteOldLogs = useCallback(() => {
    if (logsToDeleteCount === 0) {
      Alert.alert(
        t("common.error"),
        t("settings.dataCleanup.preview", { count: 0 })
      );
      return;
    }

    Alert.alert(
      t("settings.dataCleanup.alert.title"),
      t("settings.dataCleanup.alert.message", { count: logsToDeleteCount }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.dataCleanup.alert.confirm"),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const deletedCount = await pruneOldLogs(selectedDays);
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              Alert.alert(
                t("common.done"),
                t("settings.dataCleanup.success", { count: deletedCount })
              );
            } catch (error) {
              await Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Error
              );
              Alert.alert(
                t("common.error"),
                t("common.error") // Generic error message
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [logsToDeleteCount, selectedDays, pruneOldLogs, t]);

  return (
    <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View style={styles.content}>
            <AppText role="Body" color="secondary" style={styles.description}>
              {t("settings.dataCleanup.description")}
            </AppText>

            <View style={styles.optionsContainer}>
              {retentionOptions.map((option) => (
                <RadioCard
                  key={option.value ?? "all"}
                  title={option.label}
                  description={t("settings.dataCleanup.preview", {
                    count: getCountForDays(option.days),
                  })}
                  isSelected={selectedDays === option.value}
                  onSelect={() => handleSelectRetention(option.value)}
                  accessibilityLabel={option.label}
                />
              ))}
            </View>

            <View style={styles.separator} />

            <View style={styles.buttonContainer}>
              <Button
                label={t("settings.dataCleanup.buttonDelete")}
                variant="primary"
                onPress={handleDeleteOldLogs}
                isLoading={isDeleting}
                disabled={isDeleting || logsToDeleteCount === 0}
              />
            </View>
          </View>
        </ScrollView>
      </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
    },
    description: {
      marginBottom: theme.spacing.lg,
    },
    optionsContainer: {
      marginBottom: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.subtleBorder,
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      marginTop: theme.spacing.lg,
    },
  });
