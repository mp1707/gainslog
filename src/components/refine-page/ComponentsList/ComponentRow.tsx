import React, { useCallback, useEffect, useMemo } from "react";
import { View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Lightbulb } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions/SwipeToFunctions";
import { AnimatedPressable } from "@/components/shared/AnimatedPressable";
import { useTheme } from "@/theme";
import type { Colors, Theme } from "@/theme";
import { createStyles } from "./ComponentsList.styles";
import type { FoodComponent } from "@/types/models";

interface ComponentRowProps {
  component: FoodComponent;
  index: number;
  isExpanded: boolean;
  onTap: (index: number, comp: FoodComponent) => void;
  onToggleExpansion?: (index: number) => void;
  onDelete: (index: number) => void;
  onAcceptRecommendation: (index: number, comp: FoodComponent) => void;
}

const StaticComponentRow: React.FC<{
  component: FoodComponent;
  onTap: () => void;
  onDelete: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}> = ({
  component,
  onTap,
  onDelete,
  styles,
  theme,
}) => {

  return (
    <SwipeToFunctions onDelete={onDelete}>
      <View style={styles.solidBackgroundForSwipe}>
        <View
          style={{
            margin: -theme.spacing.md,
            borderRadius: theme.components.cards.cornerRadius,
          }}
        >
          <AnimatedPressable
            onPress={onTap}
            accessibilityLabel={`Edit ${component.name}`}
            accessibilityHint="Opens editor to modify amount and unit"
          >
            <View
              style={[
                styles.componentRow,
                {
                  borderRadius: theme.components.cards.cornerRadius,
                  padding: theme.spacing.md,
                  paddingRight: theme.spacing.sm,
                },
              ]}
            >
              <View style={styles.leftColumn}>
                <AppText
                  role="Headline"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.componentName}
                >
                  {component.name}
                </AppText>
              </View>
              <View style={styles.rightColumn}>
                <AppText role="Body" color="secondary">
                  {component.amount} {component.unit ?? ""}
                </AppText>
              </View>
            </View>
          </AnimatedPressable>
        </View>
      </View>
    </SwipeToFunctions>
  );
};

const RecommendationComponentRow: React.FC<{
  component: FoodComponent;
  isExpanded: boolean;
  onTap: () => void;
  onToggleExpansion: () => void;
  onDelete: () => void;
  onAcceptRecommendation: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: Colors;
  theme: Theme;
}> = ({
  component,
  isExpanded,
  onTap,
  onToggleExpansion,
  onDelete,
  onAcceptRecommendation,
  styles,
  colors,
  theme,
}) => {
  const expandProgress = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [expandProgress, isExpanded]);

  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: expandProgress.value * 200, // Reduced from 300
    opacity: expandProgress.value,
  }));

  // Lightbulb fades to 0.5 opacity when expanded (stays visible)
  const lightbulbStyle = useAnimatedStyle(() => ({
    opacity: 1 - expandProgress.value * 0.5, // Fades to 0.5, not 0
  }));

  return (
    <Animated.View>
      <SwipeToFunctions onDelete={isExpanded ? undefined : onDelete}>
        <View style={styles.solidBackgroundForSwipe}>
          <View
            style={{
              margin: -theme.spacing.md,
              borderRadius: theme.components.cards.cornerRadius,
            }}
          >
            <View>
              {/* Title Row with two separate pressables */}
              <View
                style={[
                  styles.componentRow,
                  {
                    borderRadius: theme.components.cards.cornerRadius,
                    padding: theme.spacing.md,
                    paddingRight: theme.spacing.sm,
                  },
                ]}
              >
                {/* First Pressable: Name - opens edit modal */}
                <View style={styles.leftColumn}>
                  <AnimatedPressable
                    onPress={onTap}
                    accessibilityLabel={`Edit ${component.name}`}
                    accessibilityHint="Opens editor to modify amount and unit"
                    style={styles.namePressable}
                  >
                    <AppText
                      role="Headline"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.componentName}
                    >
                      {component.name}
                    </AppText>
                  </AnimatedPressable>
                </View>

                {/* Right-aligned group: Amount + Lightbulb */}
                <View style={styles.rightColumn}>
                  <AnimatedPressable
                    onPress={onTap}
                    accessibilityLabel={`Edit ${component.name}`}
                    accessibilityHint="Opens editor to modify amount and unit"
                  >
                    <AppText role="Body" color="secondary">
                      {component.amount} {component.unit ?? ""}
                    </AppText>
                  </AnimatedPressable>

                  {/* Second Pressable: Lightbulb - toggles expansion */}
                  <AnimatedPressable
                    onPress={onToggleExpansion}
                    hitSlop={44}
                    style={{
                      width: 18,
                      height: 18,
                    }}
                    accessibilityLabel="View recommendation"
                    accessibilityHint={
                      isExpanded
                        ? "Collapse recommendation details"
                        : "Expand to see recommendation details"
                    }
                  >
                    <Animated.View style={lightbulbStyle}>
                      <Lightbulb
                        size={18}
                        color={colors.accent}
                        fill={colors.accent}
                      />
                    </Animated.View>
                  </AnimatedPressable>
                </View>
              </View>

              {/* Inline Expansion */}
              {component.recommendedMeasurement && (
                <Animated.View style={expandedStyle}>
                  <View style={styles.expansionContent}>
                    {/* Single compact row with estimate text and Set button */}
                    <View style={styles.estimateLine}>
                      <AppText
                        role="Body"
                        color="secondary"
                        style={{ flex: 1 }}
                      >
                        We estimate{" "}
                        <AppText
                          role="Body"
                          style={{ color: colors.primaryText }}
                        >
                          {component.amount} {component.unit}
                        </AppText>{" "}
                        ≈{" "}
                        <AppText
                          role="Body"
                          style={{ color: colors.primaryText }}
                        >
                          {component.recommendedMeasurement.amount}{" "}
                          {component.recommendedMeasurement.unit}
                        </AppText>
                        .
                      </AppText>

                      <Pressable
                        style={styles.acceptPill}
                        onPress={() => {
                          Haptics.impactAsync(
                            Haptics.ImpactFeedbackStyle.Light
                          );
                          onAcceptRecommendation();
                        }}
                      >
                        <AppText style={styles.acceptPillText}>
                          Set {component.recommendedMeasurement.amount}{" "}
                          {component.recommendedMeasurement.unit}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
      </SwipeToFunctions>
    </Animated.View>
  );
};

const ComponentRowComponent: React.FC<ComponentRowProps> = ({
  component,
  isExpanded,
  index,
  onTap,
  onToggleExpansion,
  onDelete,
  onAcceptRecommendation,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const hasRecommendation = !!component.recommendedMeasurement;

  const handleTap = useCallback(
    () => onTap(index, component),
    [onTap, index, component]
  );

  const handleToggleExpansion = useCallback(
    () => onToggleExpansion?.(index),
    [onToggleExpansion, index]
  );

  const handleDelete = useCallback(() => onDelete(index), [onDelete, index]);

  const handleAccept = useCallback(
    () => onAcceptRecommendation(index, component),
    [onAcceptRecommendation, index, component]
  );

  if (!hasRecommendation) {
    return (
      <StaticComponentRow
        component={component}
        onTap={handleTap}
        onDelete={handleDelete}
        styles={styles}
        theme={theme}
      />
    );
  }

  return (
    <RecommendationComponentRow
      component={component}
      isExpanded={isExpanded}
      onTap={handleTap}
      onToggleExpansion={handleToggleExpansion}
      onDelete={handleDelete}
      onAcceptRecommendation={handleAccept}
      styles={styles}
      colors={colors}
      theme={theme}
    />
  );
};

export const ComponentRow = React.memo(ComponentRowComponent, (prev, next) => {
  const prevComp = prev.component;
  const nextComp = next.component;

  const prevRec = prevComp.recommendedMeasurement;
  const nextRec = nextComp.recommendedMeasurement;

  const recommendationsEqual =
    !!prevRec === !!nextRec &&
    (!prevRec ||
      (prevRec.amount === nextRec?.amount && prevRec.unit === nextRec?.unit));

  return (
    prev.index === next.index &&
    prev.isExpanded === next.isExpanded &&
    prevComp.name === nextComp.name &&
    prevComp.amount === nextComp.amount &&
    prevComp.unit === nextComp.unit &&
    recommendationsEqual &&
    prev.onTap === next.onTap &&
    prev.onToggleExpansion === next.onToggleExpansion &&
    prev.onDelete === next.onDelete &&
    prev.onAcceptRecommendation === next.onAcceptRecommendation
  );
});
