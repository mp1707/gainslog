import React from "react";
import { View } from "react-native";
import { FoodLog } from "@/types";
import { useTheme } from "@/theme";
import { Card } from "@/components/Card";
import { AppText } from "@/components";
import { getConfidenceInfo } from "@/utils/nutrition";
import { createStyles } from "./LogCard.styles";
import { LogCardSkeleton } from "./LogCardSkeleton";
import { NutritionList } from "./NutritionList";

interface LogCardProps {
  foodLog: FoodLog;
  onPress?: () => void;
}

export const LogCard: React.FC<LogCardProps> = ({ foodLog, onPress }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Show skeleton while loading
  const isLoading = (foodLog.estimationConfidence ?? 0) === 0;

  if (isLoading) {
    return <LogCardSkeleton />;
  }

  const displayTitle = foodLog.userTitle || foodLog.generatedTitle;

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

              {foodLog.userDescription && (
                <AppText
                  role="Body"
                  color="secondary"
                  style={styles.description}
                  numberOfLines={2}
                >
                  {foodLog.userDescription}
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
                  <AppText
                    style={[styles.confidenceText, confidenceStyles.text]}
                  >
                    {confidenceInfo.label}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={styles.rightSection}>
              <NutritionList
                nutrition={{
                  calories:
                    foodLog.userCalories ?? foodLog.generatedCalories ?? 0,
                  protein: foodLog.userProtein ?? foodLog.generatedProtein ?? 0,
                  carbs: foodLog.userCarbs ?? foodLog.generatedCarbs ?? 0,
                  fat: foodLog.userFat ?? foodLog.generatedFat ?? 0,
                }}
              />
            </View>
          </View>
      </Card>
    </View>
  );
};
