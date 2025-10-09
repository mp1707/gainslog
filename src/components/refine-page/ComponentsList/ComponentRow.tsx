import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { Check, Lightbulb } from "lucide-react-native";
import { AppText } from "@/components";
import { Button } from "@/components/shared/Button/Button";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions/SwipeToFunctions";
import { useTheme } from "@/theme";
import { createStyles } from "./ComponentsList.styles";
import type { FoodComponent } from "@/types/models";

const HIGHLIGHT_BORDER_RADIUS = 14;

interface ComponentRowProps {
  component: FoodComponent;
  index: number;
  isExpanded: boolean;
  onTap: () => void;
  onDelete: () => void;
  onAcceptRecommendation: () => void;
  onEditManually: () => void;
}

export const ComponentRow: React.FC<ComponentRowProps> = ({
  component,
  isExpanded,
  onTap,
  onDelete,
  onAcceptRecommendation,
  onEditManually,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);
  const hasRecommendation = !!component.recommendedMeasurement;

  // Single source of truth for perfect animation sync
  const expandProgress = useSharedValue(0);

  useEffect(() => {
    const springConfig = {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    };

    // Single animation drives all visual changes
    expandProgress.value = withSpring(isExpanded ? 1 : 0, springConfig);
  }, [isExpanded, theme]);

  // All animations derived from single progress value
  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: expandProgress.value * 200,
    opacity: expandProgress.value,
    overflow: "hidden",
    marginTop: expandProgress.value * theme.spacing.sm,
  }));

  const lightbulbBgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      expandProgress.value,
      [0, 1],
      ["transparent", colors.tertiaryBackground]
    ),
    borderTopLeftRadius: HIGHLIGHT_BORDER_RADIUS,
    borderTopRightRadius: HIGHLIGHT_BORDER_RADIUS,
  }));

  // Conditional padding and margins only when expanded
  const lightbulbContainerStyle = useAnimatedStyle(() => {
    const isExpanding = expandProgress.value > 0;
    return {
      paddingTop: isExpanding ? theme.spacing.md : 0,
      paddingBottom: isExpanding ? theme.spacing.md : 0,
      paddingHorizontal: isExpanding ? theme.spacing.md : 0,
      marginTop: isExpanding ? -theme.spacing.md : 0,
      marginBottom: isExpanding ? -theme.spacing.md : 0,
    };
  });

  return (
    <Animated.View>
      <SwipeToFunctions
        onDelete={onDelete}
        onTap={onTap}
        borderRadius={HIGHLIGHT_BORDER_RADIUS}
      >
        <View
          style={[
            styles.solidBackgroundForSwipe,
            { borderRadius: HIGHLIGHT_BORDER_RADIUS },
          ]}
        >
          <View
            style={[
              styles.componentRow,
              { borderRadius: HIGHLIGHT_BORDER_RADIUS },
            ]}
          >
            <View style={styles.leftColumn}>
              <AppText style={styles.componentName}>{component.name}</AppText>
            </View>
            <View style={styles.rightColumn}>
              <AppText color="secondary" style={styles.amountText}>
                {component.amount} {component.unit ?? ""}
              </AppText>
              {hasRecommendation && (
                <Animated.View style={[lightbulbBgStyle, lightbulbContainerStyle]}>
                  <Lightbulb
                    size={18}
                    color={colors.semantic.fat}
                    fill={colors.semantic.fat}
                  />
                </Animated.View>
              )}
            </View>
          </View>

          {/* Expandable Recommendation Section */}
          {hasRecommendation && component.recommendedMeasurement && (
            <Animated.View style={expandedStyle}>
              <View
                style={{
                  backgroundColor: colors.tertiaryBackground,
                  paddingVertical: theme.spacing.lg,
                  paddingHorizontal: theme.spacing.md,
                  gap: theme.spacing.md,
                  borderTopLeftRadius: HIGHLIGHT_BORDER_RADIUS,
                  borderBottomLeftRadius: HIGHLIGHT_BORDER_RADIUS,
                  borderBottomRightRadius: HIGHLIGHT_BORDER_RADIUS,
                }}
              >
                <AppText role="Body" color="secondary">
                  We estimate{" "}
                  <AppText role="Body" style={{ color: colors.primaryText }}>
                    {component.amount} {component.unit}
                  </AppText>{" "}
                  is about{" "}
                  <AppText role="Body" style={{ color: colors.primaryText }}>
                    {component.recommendedMeasurement.amount}{" "}
                    {component.recommendedMeasurement.unit}
                  </AppText>
                  .
                </AppText>

                <View style={{ gap: theme.spacing.sm }}>
                  <Button
                    label="Edit Manually"
                    variant="tertiary"
                    onPress={onEditManually}
                  />
                  <Button
                    label={`Accept ${component.recommendedMeasurement.amount} ${component.recommendedMeasurement.unit}`}
                    variant="primary"
                    onPress={onAcceptRecommendation}
                    Icon={Check}
                  />
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      </SwipeToFunctions>
    </Animated.View>
  );
};
