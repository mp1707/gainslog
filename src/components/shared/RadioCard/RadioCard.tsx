import React, { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Circle, CircleCheck, CircleDot } from "lucide-react-native";
import { Card } from "@/components/Card";
import { AppText } from "@/components/shared/AppText";
import { useTheme } from "@/theme";
import { createStyles } from "./RadioCard.styles";

interface RadioCardProps {
  title: string;
  description: string;
  factor: number;
  isSelected: boolean;
  onSelect: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  title,
  description,
  factor,
  isSelected,
  onSelect,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  // Animation values
  const pressScale = useSharedValue(1);
  const selectedProgress = useSharedValue(isSelected ? 1 : 0);

  // Update selection animation when isSelected changes
  useEffect(() => {
    selectedProgress.value = withSpring(isSelected ? 1 : 0, {
      damping: 20,
      stiffness: 300,
    });
  }, [isSelected]);

  // Animated styles for press feedback
  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  // Animated styles for radio indicator
  const animatedRadioStyle = useAnimatedStyle(() => {
    const scale = interpolate(selectedProgress.value, [0, 1], [1, 1.1]);
    return {
      transform: [{ scale }],
    };
  });

  const handlePressIn = () => {
    pressScale.value = withTiming(theme.interactions.press.scale, {
      duration: theme.interactions.press.timing.duration,
      easing: theme.interactions.press.timing.easing,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, {
      damping: theme.interactions.press.spring.damping,
      stiffness: theme.interactions.press.spring.stiffness,
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect();
  };

  const RadioIndicator = isSelected ? CircleCheck : Circle;

  return (
    <Animated.View style={animatedCardStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={
          accessibilityLabel || `${title} protein goal option`
        }
        accessibilityHint={
          accessibilityHint ||
          `Select ${factor} grams per kilogram protein goal. ${description}`
        }
      >
        <Card elevated={false} padding={theme.spacing.md} style={styles.card}>
          <View style={styles.container}>
            {/* Radio Indicator */}
            <Animated.View style={[styles.radioContainer, animatedRadioStyle]}>
              <RadioIndicator
                size={24}
                color={isSelected ? colors.accent : colors.secondaryText}
                strokeWidth={2}
              />
            </Animated.View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <AppText
                  role="Body"
                  color={isSelected ? "accent" : "primary"}
                  numberOfLines={1}
                >
                  {title}
                </AppText>
                <View style={styles.factorBadge}>
                  <AppText
                    role="Caption"
                    color={isSelected ? "accent" : "primary"}
                  >
                    {factor} g Protein /kg
                  </AppText>
                </View>
              </View>
              <AppText
                role="Caption"
                color="secondary"
                numberOfLines={2}
                style={styles.description}
              >
                {description}
              </AppText>
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
};
