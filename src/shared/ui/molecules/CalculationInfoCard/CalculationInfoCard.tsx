import React, { ReactNode } from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { useTheme } from "../../../../providers/ThemeProvider";
import { AppText } from "../../../../components";

export type CalculationType = "calories" | "protein" | "fat" | "carbs";

interface CalculationInfoCardProps {
  type: CalculationType;
  headerTitle?: string;
  headerSubtitle?: string;
  highlightText: string;
  description?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const CalculationInfoCard: React.FC<CalculationInfoCardProps> = ({
  type,
  headerTitle,
  headerSubtitle,
  highlightText,
  description,
  children,
  style,
  testID,
}) => {
  const { colors, theme } = useTheme();

  const baseCard: ViewStyle = {
    borderRadius: theme.components.cards.cornerRadius,
    padding: theme.spacing.lg,
    shadowColor: colors.primaryText,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  };

  const containerStyleByType: Record<CalculationType, ViewStyle> = {
    calories: {
      ...baseCard,
      backgroundColor: colors.semanticBadges.calories.background,
    },
    protein: {
      ...baseCard,
      backgroundColor: colors.semanticBadges.protein.background,
    },
    fat: { ...baseCard, backgroundColor: colors.semanticBadges.fat.background },
    carbs: {
      ...baseCard,
      backgroundColor: colors.semanticBadges.carbs.background,
    },
  };

  const highlightColorByType: Record<CalculationType, string> = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    fat: colors.semantic.fat,
    carbs: colors.semantic.carbs,
  };

  const styles = StyleSheet.create({
    header: { marginBottom: theme.spacing.sm },
    headerTitle: { marginBottom: 2 },
    highlightText: { marginBottom: theme.spacing.sm },
  });

  return (
    <View
      style={[containerStyleByType[type], style]}
      accessibilityRole="summary"
      accessibilityLabel={`${type} calculation details card`}
      testID={testID}
    >
      {(headerTitle || headerSubtitle) && (
        <View style={styles.header}>
          {!!headerTitle && (
            <AppText role="Headline" style={styles.headerTitle}>
              {headerTitle}
            </AppText>
          )}
          {!!headerSubtitle && (
            <AppText role="Body" color="secondary">
              {headerSubtitle}
            </AppText>
          )}
        </View>
      )}

      <AppText
        role="Headline"
        style={[{ color: highlightColorByType[type] }, styles.highlightText]}
      >
        {highlightText}
      </AppText>

      {!!description && (
        <AppText role="Body" color="secondary">
          {description}
        </AppText>
      )}

      {children}
    </View>
  );
};

export default CalculationInfoCard;
