import React, { useState } from "react";
import { View, Pressable, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
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

  const handleExpand = () => {
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);

    // Animate expansion
    expandAnimation.value = withTiming(newExpandedState ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });

    // Animate chevron rotation
    chevronRotation.value = withTiming(newExpandedState ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEdit = () => {
    if (onEdit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onEdit();
    }
  };

  // Animated styles
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${interpolate(chevronRotation.value, [0, 1], [0, 180])}deg` },
    ],
  }));

  const macroContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(expandAnimation.value, [0, 0.5, 1], [1, 0, 1]),
  }));

  return (
    <Card style={styles.card}>
      <Pressable
        onPress={handleExpand}
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
                  <View style={styles.macroRow}>
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
                  </View>
                  <View style={styles.macroRow}>
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
                  </View>
                  <View style={styles.macroRow}>
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
                  </View>
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
  );
};
