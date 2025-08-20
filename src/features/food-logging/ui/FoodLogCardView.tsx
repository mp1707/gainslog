import React, { useState, useRef } from "react";
import {
  View,
  Pressable,
  TouchableOpacity,
  LayoutChangeEvent,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { CaretDownIcon } from "phosphor-react-native";
import { Badge } from "@/shared/ui";
import { CompactMacroSummary } from "@/shared/ui/atoms/CompactMacroSummary";
import { useTheme } from "@/providers/ThemeProvider";
import { createStyles } from "./components/FoodLogCard/FoodLogCard.styles";
import { AppText, Card } from "@/components";
import * as Haptics from "expo-haptics";

interface FoodLogCardViewProps {
  title: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number;
  showConfidence?: boolean;
  accessoryRight?: React.ReactNode;
  onEdit?: () => void;
}

export const FoodLogCardView: React.FC<FoodLogCardViewProps> = ({
  title,
  description,
  calories,
  protein,
  carbs,
  fat,
  confidence,
  showConfidence = false,
  accessoryRight,
  onEdit,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);
  const [expanded, setExpanded] = useState(false);

  // Height measurement states
  const [collapsedHeight, setCollapsedHeight] = useState(0);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const hasMeasuredRef = useRef({ collapsed: false, expanded: false });

  // Animation shared values
  const chevronRotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const macroStagger1 = useSharedValue(0);
  const macroStagger2 = useSharedValue(0);
  const macroStagger3 = useSharedValue(0);
  const macroStagger4 = useSharedValue(0);
  const cardElevation = useSharedValue(0);
  const contentHeight = useSharedValue(0);

  // Height measurement handlers - optimized for performance
  const onCollapsedLayout = (event: LayoutChangeEvent) => {
    if (hasMeasuredRef.current.collapsed) return;

    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setCollapsedHeight(height);
      contentHeight.value = height; // Initialize with collapsed height
      hasMeasuredRef.current.collapsed = true;
    }
  };

  const onExpandedLayout = (event: LayoutChangeEvent) => {
    if (hasMeasuredRef.current.expanded) return;

    const { height } = event.nativeEvent.layout;
    if (height > 0) {
      setExpandedHeight(height);
      hasMeasuredRef.current.expanded = true;
    }
  };

  const handleExpand = () => {
    const newExpandedState = !expanded;

    // Haptic feedback with proper timing
    runOnJS(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })();

    setExpanded(newExpandedState);

    // Height animation with satisfying iOS-style spring physics
    const targetHeight = newExpandedState ? expandedHeight : collapsedHeight;
    if (targetHeight > 0) {
      // iOS-native spring curve with subtle anticipation
      contentHeight.value = withSpring(targetHeight, {
        damping: 16, // Lower damping for subtle bounce
        stiffness: 180, // Slightly lower stiffness for smoothness
        mass: 1.0, // Perfect mass for responsive feel
        overshootClamping: false, // Allow slight overshoot for satisfaction
        restSpeedThreshold: 0.1, // Precise stopping
        restDisplacementThreshold: 0.1,
      });
    }

    // Note: expandAnimation removed as we're using direct opacity control in layout

    // Chevron rotation with spring bounce - slightly delayed for natural feel
    chevronRotation.value = withDelay(
      50,
      withSpring(newExpandedState ? 1 : 0, {
        damping: 14, // Slightly more controlled
        stiffness: 220, // Snappy rotation
        mass: 0.8, // Lighter feel for icon
      })
    );

    // Card elevation animation - subtle depth enhancement
    cardElevation.value = withSpring(newExpandedState ? 1 : 0, {
      damping: 22, // Smoother elevation
      stiffness: 120, // Gentle shadow transition
      mass: 1.0,
    });

    // Staggered macro detail animations - perfectly timed with height expansion
    if (newExpandedState) {
      // Stagger timing coordinated with height animation peak
      macroStagger1.value = withDelay(
        120,
        withSpring(1, {
          damping: 16,
          stiffness: 280,
          mass: 0.9,
        })
      );
      macroStagger2.value = withDelay(
        160,
        withSpring(1, {
          damping: 16,
          stiffness: 280,
          mass: 0.9,
        })
      );
      macroStagger3.value = withDelay(
        200,
        withSpring(1, {
          damping: 16,
          stiffness: 280,
          mass: 0.9,
        })
      );
      macroStagger4.value = withDelay(
        240,
        withSpring(1, {
          damping: 16,
          stiffness: 280,
          mass: 0.9,
        })
      );
    } else {
      // Quick but smooth collapse
      macroStagger1.value = withSpring(0, { damping: 20, stiffness: 400 });
      macroStagger2.value = withSpring(0, { damping: 20, stiffness: 400 });
      macroStagger3.value = withSpring(0, { damping: 20, stiffness: 400 });
      macroStagger4.value = withSpring(0, { damping: 20, stiffness: 400 });
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onEdit();
    }
  };

  const handlePressIn = () => {
    // Subtle scale with perfect iOS-style responsiveness
    cardScale.value = withSpring(0.96, {
      damping: 30, // Controlled bounce
      stiffness: 500, // Immediate response
      mass: 0.8, // Light, responsive feel
    });
  };

  const handlePressOut = () => {
    // Satisfying bounce back with slight overshoot
    cardScale.value = withSpring(1, {
      damping: 20, // Allow gentle overshoot
      stiffness: 350, // Snappy return
      mass: 1.0,
      overshootClamping: false, // Natural bounce feel
    });
  };

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    // Enhanced shadow animation for depth perception
    shadowOpacity: interpolate(cardElevation.value, [0, 1], [0.08, 0.16]),
    shadowRadius: interpolate(cardElevation.value, [0, 1], [6, 14]),
    shadowOffset: {
      width: 0,
      height: interpolate(cardElevation.value, [0, 1], [1, 5]),
    },
    elevation: interpolate(cardElevation.value, [0, 1], [2, 8]), // Android elevation
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  // Height animation style - the key to satisfying expansion
  const heightAnimatedStyle = useAnimatedStyle(() => ({
    height: contentHeight.value,
    overflow: "hidden",
  }));

  // Individual macro row animations with stagger
  const macroRow1Style = useAnimatedStyle(() => ({
    opacity: macroStagger1.value,
    transform: [
      {
        translateX: interpolate(macroStagger1.value, [0, 1], [20, 0]),
      },
      {
        scale: interpolate(macroStagger1.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  const macroRow2Style = useAnimatedStyle(() => ({
    opacity: macroStagger2.value,
    transform: [
      {
        translateX: interpolate(macroStagger2.value, [0, 1], [20, 0]),
      },
      {
        scale: interpolate(macroStagger2.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  const macroRow3Style = useAnimatedStyle(() => ({
    opacity: macroStagger3.value,
    transform: [
      {
        translateX: interpolate(macroStagger3.value, [0, 1], [20, 0]),
      },
      {
        scale: interpolate(macroStagger3.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  const macroRow4Style = useAnimatedStyle(() => ({
    opacity: macroStagger4.value,
    transform: [
      {
        translateX: interpolate(macroStagger4.value, [0, 1], [20, 0]),
      },
      {
        scale: interpolate(macroStagger4.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  return (
    <Animated.View style={[cardAnimatedStyle]}>
      <Card style={styles.card}>
        <Pressable
          onPress={handleExpand}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${
            expanded ? "Collapse" : "Expand"
          } nutrition details for ${title}`}
          accessibilityHint="Tap to toggle detailed macro breakdown"
        >
          <View style={styles.topSection}>
            <View style={styles.titleSection}>
              <AppText role="Headline" style={styles.title}>
                {title}
              </AppText>
              {showConfidence && typeof confidence === "number" ? (
                <Badge confidence={confidence} isLoading={false} />
              ) : null}
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                {accessoryRight}
              </View>
            </View>
            {description ? (
              <AppText role="Body" color="secondary" style={styles.description}>
                {description}
              </AppText>
            ) : null}
          </View>
          <View style={styles.bottomSection}>
            <View style={styles.bottomLeft}>
              <Badge
                variant="semantic"
                semanticType="calories"
                label={`${calories} kcal`}
              />
            </View>

            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                opacity: expanded ? 0 : 1,
              }}
              onLayout={onCollapsedLayout}
            >
              {!expanded && (
                <CompactMacroSummary
                  protein={protein}
                  carbs={carbs}
                  fat={fat}
                />
              )}
            </View>
            <Animated.View
              style={[styles.macroRowContainer, heightAnimatedStyle]}
            >
              {/* Collapsed state - always rendered for measurement */}

              {/* Expanded state - always rendered for measurement */}
              <View
                style={{
                  position: expanded ? "relative" : "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  opacity: expanded ? 1 : 0,
                }}
                onLayout={onExpandedLayout}
              >
                <View style={styles.detailedMacros}>
                  <Animated.View style={[styles.macroRow, macroRow1Style]}>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroLabel,
                        { color: colors.semantic.protein },
                      ]}
                    >
                      Protein:
                    </AppText>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroValue,
                        { color: colors.semantic.protein },
                      ]}
                    >
                      {protein}g
                    </AppText>
                  </Animated.View>
                  <Animated.View style={[styles.macroRow, macroRow2Style]}>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroLabel,
                        { color: colors.semantic.carbs },
                      ]}
                    >
                      Carbs:
                    </AppText>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroValue,
                        { color: colors.semantic.carbs },
                      ]}
                    >
                      {carbs}g
                    </AppText>
                  </Animated.View>
                  <Animated.View style={[styles.macroRow, macroRow3Style]}>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroLabel,
                        { color: colors.semantic.fat },
                      ]}
                    >
                      Fat:
                    </AppText>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroValue,
                        { color: colors.semantic.fat },
                      ]}
                    >
                      {fat}g
                    </AppText>
                  </Animated.View>
                  <Animated.View style={[styles.macroRow, macroRow4Style]}>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroLabel,
                        { color: colors.semantic.calories || colors.accent },
                      ]}
                    >
                      Calories:
                    </AppText>
                    <AppText
                      role="Body"
                      style={[
                        styles.macroValue,
                        { color: colors.semantic.calories || colors.accent },
                      ]}
                    >
                      {calories} kcal
                    </AppText>
                  </Animated.View>
                </View>
              </View>
            </Animated.View>
            <Animated.View
              style={[styles.chevronContainer, chevronAnimatedStyle]}
            >
              <CaretDownIcon
                size={16}
                color={colors.secondaryText}
                weight="regular"
              />
            </Animated.View>
          </View>
        </Pressable>
      </Card>
    </Animated.View>
  );
};
