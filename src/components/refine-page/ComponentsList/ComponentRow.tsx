import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

  // Animation values
  const expandHeight = useSharedValue(0);
  const expandOpacity = useSharedValue(0);

  useEffect(() => {
    expandHeight.value = withSpring(isExpanded ? 200 : 0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
    expandOpacity.value = withSpring(isExpanded ? 1 : 0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  }, [isExpanded, theme]);

  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: expandHeight.value,
    opacity: expandOpacity.value,
    overflow: "hidden",
  }));

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
                <View
                  style={[
                    isExpanded && {
                      backgroundColor: colors.tertiaryBackground,
                      borderTopLeftRadius: HIGHLIGHT_BORDER_RADIUS,
                      borderTopRightRadius: HIGHLIGHT_BORDER_RADIUS,
                    },
                    {
                      paddingTop: theme.spacing.md,
                      paddingBottom: theme.spacing.md,
                      paddingHorizontal: theme.spacing.md,
                      marginTop: -theme.spacing.md,
                      marginBottom: -theme.spacing.md,
                    },
                  ]}
                >
                  <Lightbulb
                    size={18}
                    color={colors.semantic.fat}
                    fill={colors.semantic.fat}
                  />
                </View>
              )}
            </View>
          </View>

          {/* Expandable Recommendation Section */}
          {hasRecommendation && component.recommendedMeasurement && (
            <Animated.View style={expandedStyle}>
              <View
                style={{
                  backgroundColor: colors.tertiaryBackground,
                  padding: theme.spacing.md,
                  marginTop: theme.spacing.sm,
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
