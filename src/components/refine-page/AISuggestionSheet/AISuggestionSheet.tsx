import React, { useMemo } from "react";
import { View } from "react-native";
import * as Haptics from "expo-haptics";
import { Info, Lightbulb } from "lucide-react-native";
import { AppText } from "@/components/shared/AppText";
import { Button } from "@/components/shared/Button/Button";
import { useTheme } from "@/theme";
import { createStyles } from "./AISuggestionSheet.styles";
import type { FoodComponent } from "@/types/models";

interface AISuggestionSheetProps {
  component: FoodComponent;
  onUseRecommendation: () => void;
  onEditManually: () => void;
}

export const AISuggestionSheet: React.FC<AISuggestionSheetProps> = ({
  component,
  onUseRecommendation,
  onEditManually,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  if (!component.recommendedMeasurement) {
    return null;
  }

  const originalText = `${component.amount} ${component.unit}`;
  const recommendedText = `${component.recommendedMeasurement.amount} ${component.recommendedMeasurement.unit}`;

  const handleUseRecommendation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onUseRecommendation();
  };

  const handleEditManually = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onEditManually();
  };

  return (
    <View style={styles.container}>
      {/* Header with Icon */}
      <View style={styles.header}>
        <Lightbulb
          size={24}
          color={colors.semantic.fat}
          fill={colors.semantic.fat}
        />

        <AppText role="Title2">Improve Accuracy?</AppText>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <AppText role="Body" color="secondary">
          We estimate{" "}
          <AppText role="Body" style={styles.highlightText}>
            {originalText}
          </AppText>{" "}
          is about{" "}
          <AppText role="Body" style={styles.highlightText}>
            {recommendedText}
          </AppText>
          .
        </AppText>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={styles.buttonWrapper}>
          <Button
            label={`Accept ${recommendedText}`}
            variant="primary"
            onPress={handleUseRecommendation}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            label="Edit Manually"
            variant="tertiary"
            onPress={handleEditManually}
          />
        </View>
      </View>
    </View>
  );
};
