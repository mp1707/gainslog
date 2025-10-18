import React, { useCallback, useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  Easing,
} from "react-native-reanimated";
import { Check, Lightbulb, X } from "lucide-react-native";
import { AppText } from "@/components";
import { Button } from "@/components/shared/Button/Button";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions/SwipeToFunctions";
import { useTheme } from "@/theme";
import type { Colors, Theme } from "@/theme";
import { createStyles } from "./ComponentsList.styles";
import type { FoodComponent } from "@/types/models";

interface ComponentRowProps {
  component: FoodComponent;
  index: number;
  isExpanded: boolean;
  onTap: (index: number, comp: FoodComponent) => void;
  onDelete: (index: number) => void;
  onAcceptRecommendation: (index: number, comp: FoodComponent) => void;
  onEditManually: (index: number, comp: FoodComponent) => void;
}

const StaticComponentRow: React.FC<{
  component: FoodComponent;
  onTap: () => void;
  onDelete: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}> = ({ component, onTap, onDelete, styles, theme }) => (
  <SwipeToFunctions onDelete={onDelete} onTap={onTap}>
    <View style={styles.solidBackgroundForSwipe}>
      <View
        style={{
          margin: -theme.spacing.md,
          borderRadius: theme.components.cards.cornerRadius,
        }}
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
            <AppText numberOfLines={1} style={styles.componentName}>
              {component.name}
            </AppText>
          </View>
          <View style={styles.rightColumn}>
            <AppText color="secondary">
              {component.amount} {component.unit ?? ""}
            </AppText>
          </View>
        </View>
      </View>
    </View>
  </SwipeToFunctions>
);

const RecommendationComponentRow: React.FC<{
  component: FoodComponent;
  isExpanded: boolean;
  onTap: () => void;
  onDelete: () => void;
  onAcceptRecommendation: () => void;
  onEditManually: () => void;
  styles: ReturnType<typeof createStyles>;
  colors: Colors;
  theme: Theme;
}> = ({
  component,
  isExpanded,
  onTap,
  onDelete,
  onAcceptRecommendation,
  onEditManually,
  styles,
  colors,
  theme,
}) => {
  const expandProgress = useSharedValue(0);

  useEffect(() => {
    expandProgress.value = withTiming(isExpanded ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [expandProgress, isExpanded]);

  const expandedStyle = useAnimatedStyle(() => ({
    maxHeight: expandProgress.value * 300,
    opacity: expandProgress.value,
    marginTop: expandProgress.value * theme.spacing.md,
  }));

  const borderStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      expandProgress.value,
      [0, 1],
      ["transparent", colors.tertiaryBackground]
    ),
    borderRadius: theme.components.cards.cornerRadius,
    margin: -theme.spacing.md,
  }));

  const paddingStyle = useAnimatedStyle(() => ({
    padding: theme.spacing.md,
    paddingRight: theme.spacing.sm,
  }));

  const lightbulbStyle = useAnimatedStyle(() => ({
    opacity: 1 - expandProgress.value,
    transform: [{ scale: 1 - expandProgress.value * 0.5 }],
  }));

  const xIconStyle = useAnimatedStyle(() => ({
    opacity: expandProgress.value,
    transform: [{ scale: 0.5 + expandProgress.value * 0.5 }],
  }));

  return (
    <Animated.View>
      <SwipeToFunctions
        onDelete={isExpanded ? undefined : onDelete}
        onTap={onTap}
      >
        <View style={styles.solidBackgroundForSwipe}>
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
                <AppText color="secondary">
                  {component.amount} {component.unit ?? ""}
                </AppText>
                <View
                  style={{
                    marginLeft: theme.spacing.sm,
                    width: 18,
                    height: 18,
                  }}
                >
                  <Animated.View style={[{ position: "absolute" }, lightbulbStyle]}>
                    <Lightbulb
                      size={18}
                      color={colors.semantic.fat}
                      fill={colors.semantic.fat}
                    />
                  </Animated.View>
                  <Animated.View
                    style={[
                      {
                        position: "absolute",
                        backgroundColor: colors.secondaryBackground,
                        padding: theme.spacing.xs,
                        margin: -theme.spacing.xs,
                        borderRadius: 18,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: colors.border,
                      },
                      xIconStyle,
                    ]}
                  >
                    <X
                      size={18}
                      color={colors.secondaryText}
                      strokeWidth={2}
                      fill={colors.secondaryText}
                    />
                  </Animated.View>
                </View>
              </View>
            </Animated.View>

            {component.recommendedMeasurement && (
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

const ComponentRowComponent: React.FC<ComponentRowProps> = ({
  component,
  isExpanded,
  index,
  onTap,
  onDelete,
  onAcceptRecommendation,
  onEditManually,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const hasRecommendation = !!component.recommendedMeasurement;

  const handleTap = useCallback(() => onTap(index, component), [
    onTap,
    index,
    component,
  ]);

  const handleDelete = useCallback(() => onDelete(index), [onDelete, index]);

  const handleAccept = useCallback(
    () => onAcceptRecommendation(index, component),
    [onAcceptRecommendation, index, component]
  );

  const handleEdit = useCallback(
    () => onEditManually(index, component),
    [onEditManually, index, component]
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
      onDelete={handleDelete}
      onAcceptRecommendation={handleAccept}
      onEditManually={handleEdit}
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
    (!!prevRec === !!nextRec) &&
    (!prevRec ||
      (prevRec.amount === nextRec?.amount &&
        prevRec.unit === nextRec?.unit));

  return (
    prev.index === next.index &&
    prev.isExpanded === next.isExpanded &&
    prevComp.name === nextComp.name &&
    prevComp.amount === nextComp.amount &&
    prevComp.unit === nextComp.unit &&
    recommendationsEqual &&
    prev.onTap === next.onTap &&
    prev.onDelete === next.onDelete &&
    prev.onAcceptRecommendation === next.onAcceptRecommendation &&
    prev.onEditManually === next.onEditManually
  );
});
