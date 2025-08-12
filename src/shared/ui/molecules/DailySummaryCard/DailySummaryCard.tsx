import React, { useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "@/providers/ThemeProvider";
import { Card } from "@/components/Card";
import { AppText } from "@/components/AppText";
import { ProgressRow } from "@/components/ProgressRow";
import { useStyles } from "./DailySummaryCard.styles";

export function DailySummaryCard({
  dateIso,
  calories,
  protein,
  carbs,
  fat,
  onPress,
  visible,
}: {
  dateIso: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onPress: () => void;
  visible?: {
    calories: boolean;
    protein: boolean;
    carbs: boolean;
    fat: boolean;
  };
}) {
  const styles = useStyles();
  const { colors } = useTheme();

  // Format date like "12. Aug"
  const formatDate = (dateString: string): string => {
    const d = new Date(dateString + "T00:00:00");
    const month = d.toLocaleDateString("en-US", { month: "short" });
    return `${d.getDate()}. ${month}`;
  };

  // Press animation shared values
  const pressScale = useSharedValue(1);
  const pressBackgroundOpacity = useSharedValue(0);

  const handlePressIn = () => {
    pressScale.value = withTiming(0.96, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
    pressBackgroundOpacity.value = withTiming(0.04, {
      duration: 150,
      easing: Easing.out(Easing.quad),
    });
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, { damping: 22, stiffness: 300 });
    pressBackgroundOpacity.value = withTiming(0, {
      duration: 350,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: pressBackgroundOpacity.value,
    backgroundColor: colors.primaryText,
  }));

  const caloriesColor = colors.semantic.calories;
  const proteinColor = colors.semantic.protein;
  const carbsColor = colors.semantic.carbs;
  const fatColor = colors.semantic.fat;

  const parts: string[] = [];
  if (visible?.calories) parts.push(`Calories ${Math.round(calories)} percent`);
  if (visible?.protein) parts.push(`Protein ${Math.round(protein)} percent`);
  if (visible?.carbs) parts.push(`Carbs ${Math.round(carbs)} percent`);
  if (visible?.fat) parts.push(`Fat ${Math.round(fat)} percent`);
  const accessibility = `"${formatDate(dateIso)}"${
    parts.length ? ", " + parts.join(", ") : ""
  }`;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityLabel={accessibility}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
        <Card>
          <View style={styles.row}>
            <View style={styles.dateColumn}>
              <AppText role="Headline">{formatDate(dateIso)}</AppText>
            </View>
            <View style={styles.metricsColumn}>
              {visible?.calories && (
                <>
                  <ProgressRow
                    label="Calories"
                    value={calories}
                    color={caloriesColor}
                  />
                  {(visible?.protein || visible?.carbs || visible?.fat) && (
                    <View style={styles.rowGap} />
                  )}
                </>
              )}
              {visible?.protein && (
                <>
                  <ProgressRow
                    label="Protein"
                    value={protein}
                    color={proteinColor}
                  />
                  {(visible?.carbs || visible?.fat) && (
                    <View style={styles.rowGap} />
                  )}
                </>
              )}
              {visible?.carbs && (
                <>
                  <ProgressRow label="Carbs" value={carbs} color={carbsColor} />
                  {visible?.fat && <View style={styles.rowGap} />}
                </>
              )}
              {visible?.fat && (
                <ProgressRow label="Fat" value={fat} color={fatColor} />
              )}
            </View>
          </View>
        </Card>
        <Animated.View
          style={[styles.pressOverlay, backgroundAnimatedStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
}
