import React, { useCallback, useMemo } from "react";
import { View, Pressable } from "react-native";
import { Lightbulb } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { AppText } from "@/components";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions/SwipeToFunctions";
import { AnimatedPressable } from "@/components/shared/AnimatedPressable";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { useTheme } from "@/theme";
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

const easeLayout = Layout.duration(220).easing(Easing.inOut(Easing.quad));

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
  const canExpand = hasRecommendation && !!onToggleExpansion;
  const showExpansion = hasRecommendation && isExpanded;

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

  return (
    <Animated.View layout={easeLayout}>
      <SwipeToFunctions onDelete={showExpansion ? undefined : handleDelete}>
        <View style={styles.solidBackgroundForSwipe}>
          <View
            style={{
              margin: -theme.spacing.md,
              borderRadius: theme.components.cards.cornerRadius,
            }}
          >
            <View>
              <View
                style={[
                  styles.componentRow,
                  {
                    borderRadius: theme.components.cards.cornerRadius,
                    padding: theme.spacing.md,
                    paddingRight: theme.spacing.sm,
                    gap: canExpand ? 16 : 0,
                  },
                ]}
              >
                <View style={{ flex: 1, minWidth: 0 }}>
                  <AnimatedPressable
                    onPress={handleTap}
                    accessibilityLabel={`Edit ${component.name}`}
                    accessibilityHint="Opens editor to modify amount and unit"
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: theme.spacing.md,
                      }}
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
                      <Animated.View
                        layout={easeLayout}
                        style={styles.rightColumn}
                      >
                        <AppText role="Body" color="secondary">
                          {component.amount} {component.unit ?? ""}
                        </AppText>
                      </Animated.View>
                    </View>
                  </AnimatedPressable>
                </View>

                <Animated.View
                  layout={easeLayout}
                  style={{
                    width: canExpand ? 18 : 0,
                    opacity: canExpand ? 1 : 0,
                    marginRight: canExpand ? theme.spacing.sm : 0,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  pointerEvents={canExpand ? "auto" : "none"}
                >
                  {canExpand ? (
                    <AnimatedPressable
                      onPress={handleToggleExpansion}
                      hitSlop={22}
                      style={{
                        width: 18,
                        height: 18,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      accessibilityLabel="View recommendation"
                      accessibilityHint={
                        isExpanded
                          ? "Collapse recommendation details"
                          : "Expand to see recommendation details"
                      }
                    >
                      <Lightbulb
                        size={18}
                        color={colors.accent}
                        fill={colors.accent}
                      />
                    </AnimatedPressable>
                  ) : null}
                </Animated.View>
              </View>

              {hasRecommendation ? (
                <Animated.View
                  layout={easeLayout}
                  style={{ overflow: "hidden" }}
                >
                  {showExpansion ? (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(160)}
                      style={styles.expansionContent}
                    >
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
                            {component.recommendedMeasurement?.amount}{" "}
                            {component.recommendedMeasurement?.unit}
                          </AppText>
                          .
                        </AppText>

                        <Pressable
                          style={styles.acceptPill}
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            handleAccept();
                          }}
                        >
                          <AppText style={styles.acceptPillText}>
                            Set {component.recommendedMeasurement?.amount}{" "}
                            {component.recommendedMeasurement?.unit}
                          </AppText>
                        </Pressable>
                      </View>
                    </Animated.View>
                  ) : null}
                </Animated.View>
              ) : null}
            </View>
          </View>
        </View>
      </SwipeToFunctions>
    </Animated.View>
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
