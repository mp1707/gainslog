import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme";
import { theme } from "@/theme";
import { LegacyFoodLog } from "src/types-legacy/indexLegacy";

interface MetadataSectionProps {
  log: LegacyFoodLog;
}

export const MetadataSection: React.FC<MetadataSectionProps> = ({ log }) => {
  const { colors } = useTheme();

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const timeString = date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) {
      return `Logged today at ${timeString}`;
    } else {
      const dateString = date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      return `Logged ${dateString} at ${timeString}`;
    }
  };

  const getConfidenceBadge = () => {
    if (typeof log.estimationConfidence !== "number") return null;

    // Convert numeric confidence to string key (assuming 0-1 scale)
    let confidenceKey: "high" | "medium" | "low" | "uncertain";
    if (log.estimationConfidence >= 0.8) {
      confidenceKey = "high";
    } else if (log.estimationConfidence >= 0.6) {
      confidenceKey = "medium";
    } else if (log.estimationConfidence >= 0.3) {
      confidenceKey = "low";
    } else {
      confidenceKey = "uncertain";
    }

    const confidenceConfig = colors.confidence[confidenceKey];
    const confidenceText =
      confidenceKey.charAt(0).toUpperCase() +
      confidenceKey.slice(1) +
      " Accuracy";

    return (
      <View
        style={[
          styles.confidenceBadge,
          { backgroundColor: confidenceConfig.background },
        ]}
      >
        <Text style={[styles.confidenceText, { color: confidenceConfig.text }]}>
          {confidenceText}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.timestamp, { color: colors.secondaryText }]}>
        {formatTimestamp(log.createdAt)}
      </Text>
      {getConfidenceBadge()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.pageMargins.horizontal,
    paddingVertical: theme.spacing.md,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  timestamp: {
    ...theme.typography.Caption,
  },
  confidenceBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
  },
  confidenceText: {
    ...theme.typography.Caption,
    fontWeight: "500",
  },
});
