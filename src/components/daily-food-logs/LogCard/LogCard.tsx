import React from "react";
import { View, Text } from "react-native";
import { FoodLog } from "@/types/models";
import { useTheme } from "@/theme";
import { Card } from "@/components/Card";
import { AppText } from "@/components";
import { getConfidenceInfo } from "@/utils/nutrition";
import { createStyles } from "./LogCard.styles";
import { LogCardSkeleton } from "./LogCardSkeleton";
import { NutritionList } from "./NutritionList";

interface LogCardProps {
  foodLog: FoodLog;
  isLoading?: boolean;
}

export const LogCard: React.FC<LogCardProps> = ({ foodLog, isLoading }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (isLoading) {
    return <LogCardSkeleton />;
  }

  const displayTitle = foodLog.title || "New Log";
  const confidenceInfo = getConfidenceInfo(foodLog.estimationConfidence ?? 0);
  const ConfidenceIcon = confidenceInfo.icon;

  const getConfidenceStyles = (level: string) => {
    const styleMap = {
      high: { badge: styles.confidenceHigh, text: styles.confidenceHighText },
      medium: {
        badge: styles.confidenceMedium,
        text: styles.confidenceMediumText,
      },
      low: { badge: styles.confidenceLow, text: styles.confidenceLowText },
      uncertain: {
        badge: styles.confidenceUncertain,
        text: styles.confidenceUncertainText,
      },
    };
    return styleMap[level as keyof typeof styleMap];
  };

  const confidenceStyles = getConfidenceStyles(confidenceInfo.level);

  return (
    <View style={styles.cardContainer}>
      <Card elevated={true} style={styles.card}>
        <View style={styles.contentContainer}>
          <View style={styles.leftSection}>
            <AppText role="Headline" style={styles.title} numberOfLines={2}>
              {displayTitle}
            </AppText>
            {foodLog.description && (
              <AppText
                role="Body"
                color="secondary"
                style={styles.description}
                numberOfLines={2}
              >
                {foodLog.description}
              </AppText>
            )}

            <View style={styles.confidenceContainer}>
              <View
                style={[styles.confidenceBadge, confidenceStyles.badge]}
                accessibilityRole="text"
                accessibilityLabel={confidenceInfo.accessibilityLabel}
              >
                <ConfidenceIcon
                  size={14}
                  color={confidenceStyles.text.color}
                  weight="fill"
                />
                <AppText style={[styles.confidenceText, confidenceStyles.text]}>
                  {confidenceInfo.label}
                </AppText>
              </View>
            </View>
          </View>

          <View style={styles.rightSection}>
            <NutritionList
              nutrition={{
                calories: foodLog.calories,
                protein: foodLog.protein,
                carbs: foodLog.carbs,
                fat: foodLog.fat,
              }}
            />
          </View>
        </View>
      </Card>
    </View>
  );
};
