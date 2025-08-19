import React, { useState } from "react";
import { View, Pressable, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { CaretDownIcon, PencilSimpleIcon } from "phosphor-react-native";
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
  showImageIcon?: boolean;
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
  showImageIcon = false,
  confidence,
  showConfidence = false,
  accessoryRight,
  onEdit,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors);
  const [expanded, setExpanded] = useState(false);

  // Animation shared values
  const expandAnimation = useSharedValue(0);
  const chevronRotation = useSharedValue(0);
  const cardScale = useSharedValue(1);
  const macroStagger1 = useSharedValue(0);
  const macroStagger2 = useSharedValue(0);
  const macroStagger3 = useSharedValue(0);
  const cardElevation = useSharedValue(0);

  const handleExpand = () => {
    const newExpandedState = !expanded;
    
    // Haptic feedback with proper timing
    runOnJS(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    })();
    
    setExpanded(newExpandedState);

    // Spring-based expansion animation (iOS-style)
    expandAnimation.value = withSpring(newExpandedState ? 1 : 0, {
      damping: 15,
      stiffness: 150,
      mass: 1,
    });

    // Chevron rotation with spring bounce
    chevronRotation.value = withSpring(newExpandedState ? 1 : 0, {
      damping: 12,
      stiffness: 200,
    });

    // Card elevation animation
    cardElevation.value = withSpring(newExpandedState ? 1 : 0, {
      damping: 20,
      stiffness: 100,
    });

    // Staggered macro detail animations (only when expanding)
    if (newExpandedState) {
      macroStagger1.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 300 }));
      macroStagger2.value = withDelay(150, withSpring(1, { damping: 15, stiffness: 300 }));
      macroStagger3.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 300 }));
    } else {
      // Reset stagger animations immediately when collapsing
      macroStagger1.value = 0;
      macroStagger2.value = 0;
      macroStagger3.value = 0;
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onEdit();
    }
  };

  const handlePressIn = () => {
    cardScale.value = withSpring(0.95, {
      damping: 25,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, {
      damping: 25,
      stiffness: 400,
    });
  };

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    shadowOpacity: interpolate(cardElevation.value, [0, 1], [0.1, 0.2]),
    shadowRadius: interpolate(cardElevation.value, [0, 1], [8, 12]),
    shadowOffset: {
      width: 0,
      height: interpolate(cardElevation.value, [0, 1], [2, 4]),
    },
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const macroContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandAnimation.value, [0, 0.3, 1], [1, 0.3, 1]),
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
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {showConfidence && typeof confidence === "number" ? (
                <Badge confidence={confidence} isLoading={false} />
              ) : null}
              {accessoryRight}
              {onEdit && (
                <TouchableOpacity
                  onPress={handleEdit}
                  style={[
                    styles.editButton,
                    { backgroundColor: colors.iconBadge.background },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Edit food entry"
                  accessibilityHint="Tap to edit this food log entry"
                >
                  <PencilSimpleIcon
                    size={16}
                    color={colors.iconBadge.iconColor}
                    weight="regular"
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {description ? (
            <AppText role="Body" color="secondary" style={styles.description}>
              {description}
            </AppText>
          ) : null}
        </View>
        <View style={styles.bottomSection}>
          <Badge
            variant="semantic"
            semanticType="calories"
            label={`${calories} kcal`}
          />
          {!showImageIcon ? (
            <Badge variant="icon" iconType="image" />
          ) : (
            <View />
          )}

          <View style={styles.macroRowContainer}>
            <Animated.View style={macroContentStyle}>
              {expanded ? (
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
                </View>
              ) : (
                <CompactMacroSummary
                  protein={protein}
                  carbs={carbs}
                  fat={fat}
                />
              )}
            </Animated.View>
          </View>
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
