import React, { useMemo } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "@/components";
import { Card } from "@/components/Card";
import { Theme, useTheme } from "@/theme";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { DashboardRing } from "@/components/shared/ProgressRings";

interface NutrientCardProps {
  /** The nutrient key */
  nutrientKey: "calories" | "protein" | "fat" | "carbs";

  /** Whether to display progress ring (true for calories/protein) */
  showRing?: boolean;

  /** Ring props (only used if showRing is true) */
  ringPercentage?: number;
  ringColor?: string;
  ringTrackColor?: string;
  ringDeltaValue?: number | string;
  ringDeltaLabel?: string;
  ringChevronIcon?: LucideIcon;
  ringAnimationDelay?: number;
  ringSkipAnimation?: boolean;

  /** Icon component to display */
  Icon: LucideIcon;
  /** Icon color */
  iconColor: string;
  /** Icon fill color */
  iconFill: string;
  /** Icon stroke width */
  iconStrokeWidth?: number;
  /** Animated scale for icon */
  iconScale: SharedValue<number>;

  /** Label text */
  label: string;
  /** Current animated value */
  currentValue: number | string;
  /** Target value */
  targetValue: number;
  /** Optional unit to append to values (e.g., "g", "kcal") */
  unit?: string;
  /** Whether this nutrient has a target */
  hasTarget: boolean;

  /** Press handler */
  onPress: () => void;
}

/**
 * Unified nutrient card component for all 4 nutrients
 *
 * Self-contained vertical layout:
 * - Progress ring (optional, for calories/protein)
 * - Icon (centered, animated)
 * - Label
 * - Current / Target values
 *
 * Features:
 * - Consistent structure across all nutrients
 * - Perfect tap target
 * - Clear visual hierarchy
 * - Follows Apple HIG for grouped content
 */
export const NutrientCard: React.FC<NutrientCardProps> = ({
  showRing = false,
  ringPercentage = 0,
  ringColor,
  ringTrackColor,
  ringDeltaValue: _ringDeltaValue,
  ringDeltaLabel: _ringDeltaLabel,
  ringChevronIcon,
  ringAnimationDelay = 0,
  ringSkipAnimation = false,
  Icon,
  iconColor,
  iconFill,
  iconStrokeWidth = 0,
  iconScale,
  label,
  currentValue,
  targetValue,
  unit,
  hasTarget,
  onPress,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { handlePressIn, handlePressOut, pressAnimatedStyle } = usePressAnimation();

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const isRingCard = showRing && ringColor && ringTrackColor && ringChevronIcon;
  const formattedCurrentValue =
    currentValue === undefined || currentValue === null
      ? "0"
      : `${currentValue}`;
  const formattedTargetValue = hasTarget
    ? `of ${targetValue}${unit ? ` ${unit}` : ""}`
    : undefined;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.wrapper}
    >
      <Animated.View style={pressAnimatedStyle}>
        <Card padding={theme.spacing.md} elevated={true}>
          <View style={styles.cardContent}>
            {isRingCard ? (
              <>
                <View style={styles.headerRow}>
                  <Animated.View style={iconAnimatedStyle}>
                    <Icon
                      size={20}
                      color={iconColor}
                      fill={iconFill}
                      strokeWidth={iconStrokeWidth}
                    />
                  </Animated.View>
                  <AppText role="Caption" color="secondary">
                    {label}
                  </AppText>
                </View>
                <View style={styles.ringSection}>
                  <DashboardRing
                    percentage={ringPercentage}
                    color={ringColor}
                    trackColor={ringTrackColor}
                    label={label}
                    displayValue={formattedCurrentValue}
                    detailValue={formattedTargetValue}
                    showDetail={false}
                    animationDelay={ringAnimationDelay}
                    size={152}
                    strokeWidth={18}
                    Icon={ringChevronIcon}
                    skipAnimation={ringSkipAnimation}
                    valueRole="Title1"
                    detailRole="Caption"
                  />
                </View>
              </>
            ) : (
              <View style={styles.contentRow}>
                <View style={styles.iconSection}>
                  <Animated.View style={iconAnimatedStyle}>
                    <Icon
                      size={20}
                      color={iconColor}
                      fill={iconFill}
                      strokeWidth={iconStrokeWidth}
                    />
                  </Animated.View>
                </View>
                <View style={styles.textSection}>
                  <AppText role="Caption" color="secondary">
                    {label}
                  </AppText>
                  <View style={styles.valuesRow}>
                    {hasTarget ? (
                      <>
                        <AppText role="Body" color="primary">
                          {currentValue}
                        </AppText>
                        <AppText role="Caption" color="secondary">
                          {" / "}
                        </AppText>
                        <AppText role="Caption" color="secondary">
                          {targetValue}
                          {unit}
                        </AppText>
                      </>
                    ) : (
                      <AppText role="Body" color="primary">
                        {currentValue}
                        {unit}
                      </AppText>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    </Pressable>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    cardContent: {
      gap: theme.spacing.md,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    ringSection: {
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      paddingBottom: theme.spacing.xs,
      marginTop: -theme.spacing.xs,
    },
    contentRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    iconSection: {
      justifyContent: "center",
    },
    textSection: {
      flex: 1,
      gap: theme.spacing.xs / 2,
    },
    valuesRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
