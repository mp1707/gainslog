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
    maxHeight: expandProgress.value * 300,
    opacity: expandProgress.value,
    marginTop: expandProgress.value * theme.spacing.md,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    borderWidth: expandProgress.value * 2,
    borderColor: colors.tertiaryBackground,
    backgroundColor: colors.tertiaryBackground,
    borderRadius: theme.components.cards.cornerRadius,
    margin: expandProgress.value * -theme.spacing.md,
  }));

  const paddingStyle = useAnimatedStyle(() => ({
    padding: expandProgress.value * theme.spacing.md,
  }));

  const lightbulbStyle = useAnimatedStyle(() => ({
    opacity: 1 - expandProgress.value,
    transform: [{ scale: 1 - expandProgress.value * 0.5 }],
  }));

  const amountSlideStyle = useAnimatedStyle(() => ({
    marginRight:
      expandProgress.value * -(theme.spacing.sm + 18 + theme.spacing.sm),
  }));

  return (
    <Animated.View>
      <SwipeToFunctions
        onDelete={isExpanded ? undefined : onDelete}
        onTap={onTap}
        borderRadius={theme.components.cards.cornerRadius}
      >
        <View
          style={[
            styles.solidBackgroundForSwipe,
            { borderRadius: theme.components.cards.cornerRadius },
          ]}
        >
          <Animated.View style={borderStyle}>
            <Animated.View
              style={[
                styles.componentRow,
                { borderRadius: theme.components.cards.cornerRadius },
                paddingStyle,
              ]}
            >
              <View style={styles.leftColumn}>
                <AppText numberOfLines={1} style={styles.componentName}>
                  {component.name}
                </AppText>
              </View>
              <View style={styles.rightColumn}>
                <Animated.View style={amountSlideStyle}>
                  <AppText color="secondary">
                    {component.amount} {component.unit ?? ""}
                  </AppText>
                </Animated.View>
                {hasRecommendation && (
                  <Animated.View
                    style={[{ marginLeft: theme.spacing.sm }, lightbulbStyle]}
                  >
                    <Lightbulb
                      size={18}
                      color={colors.semantic.fat}
                      fill={colors.semantic.fat}
                    />
                  </Animated.View>
                )}
              </View>
            </Animated.View>

            {/* Expandable Recommendation Section */}
            {hasRecommendation && component.recommendedMeasurement && (
              <Animated.View style={expandedStyle}>
                <View
                  style={{
                    padding: theme.spacing.md,
                    gap: theme.spacing.xl,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      gap: theme.spacing.sm,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Lightbulb
                      size={18}
                      color={colors.semantic.fat}
                      fill={colors.semantic.fat}
                    />
                    <AppText role="Body" color="secondary">
                      We estimate{" "}
                      <AppText
                        role="Body"
                        style={{ color: colors.primaryText }}
                      >
                        {component.amount} {component.unit}
                      </AppText>{" "}
                      is about{" "}
                      <AppText
                        role="Body"
                        style={{ color: colors.primaryText }}
                      >
                        {component.recommendedMeasurement.amount}{" "}
                        {component.recommendedMeasurement.unit}
                      </AppText>
                      .
                    </AppText>
                  </View>

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
          </Animated.View>
        </View>
      </SwipeToFunctions>
    </Animated.View>
  );
};
