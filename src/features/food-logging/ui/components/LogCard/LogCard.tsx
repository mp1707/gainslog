import React from "react";
import { View, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { FoodLog } from "@/types";
import { useTheme } from "@/providers/ThemeProvider";
import { Card } from "@/components/Card";
import { AppText } from "@/components";
import { NutritionList } from "@/shared/ui/molecules";
import { getConfidenceInfo } from "../../../utils";
import { createStyles } from "./LogCard.styles";

interface LogCardProps {
  foodLog: FoodLog;
  onAddInfo: (log: FoodLog) => void;
}

export const LogCard: React.FC<LogCardProps> = ({ foodLog, onAddInfo }) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Get display title (user title or generated title)
  const displayTitle = foodLog.userTitle || foodLog.generatedTitle;

  // Handle card tap - opens edit modal
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddInfo(foodLog);
  };

  // Get confidence indicator based on estimation confidence
  const confidenceInfo = getConfidenceInfo(foodLog.estimationConfidence);
  const ConfidenceIcon = confidenceInfo.icon;

  // Map confidence level to style variants
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
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => [
            styles.pressable,
            {
              opacity: pressed ? 0.95 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Edit food log: ${displayTitle}`}
          accessibilityHint="Double tap to edit this food log entry"
        >
          <View style={styles.contentContainer}>
            {/* Left Section - Title and Description */}
            <View style={styles.leftSection}>
              <View style={styles.textContainer}>
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
              </View>
              <View
                style={styles.confidenceBadge}
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

            {/* Right Section - Nutrition */}
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
        </Pressable>
      </Card>
    </View>
  );
};
