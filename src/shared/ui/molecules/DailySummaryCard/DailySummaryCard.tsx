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

export function DailySummaryCard({
  dateIso,
  calories,
  protein,
  carbs,
  fat,
  prev,
}: {
  dateIso: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prev?: { calories: number; protein: number; carbs: number; fat: number };
}) {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme, colorScheme), [colors, theme, colorScheme]);

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
    pressScale.value = withTiming(0.96, { duration: 150, easing: Easing.out(Easing.quad) });
    pressBackgroundOpacity.value = withTiming(0.04, { duration: 150, easing: Easing.out(Easing.quad) });
  };
  const handlePressOut = () => {
    pressScale.value = withSpring(1.0, { damping: 22, stiffness: 300 });
    pressBackgroundOpacity.value = withTiming(0, { duration: 350, easing: Easing.bezier(0.25, 1, 0.5, 1) });
  };

  const containerAnimatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressScale.value }] }));
  const backgroundAnimatedStyle = useAnimatedStyle(() => ({ opacity: pressBackgroundOpacity.value, backgroundColor: colors.primaryText }));

  const caloriesColor = colors.semantic?.calories || "#00C853";
  const proteinColor = colors.semantic?.protein || "#2962FF";
  const carbsColor = colors.semantic?.carbs || "#FF6D00";
  const fatColor = colors.semantic?.fat || "#FDB813";

  const accessibility = `"${formatDate(dateIso)}", Calories ${Math.round(calories)} percent, Protein ${Math.round(
    protein
  )} percent, Carbs ${Math.round(carbs)} percent, Fat ${Math.round(fat)} percent`;

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityLabel={accessibility}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.cardContainer, containerAnimatedStyle]}>
        <Card style={styles.card}>
          <View style={styles.row}>
            <View style={styles.dateColumn}>
              <AppText role="Headline">{formatDate(dateIso)}</AppText>
            </View>
            <View style={styles.metricsColumn}>
              <ProgressRow label="Calories" value={calories} prevValue={prev?.calories} color={caloriesColor} />
              <View style={styles.rowGap} />
              <ProgressRow label="Protein" value={protein} prevValue={prev?.protein} color={proteinColor} />
              <View style={styles.rowGap} />
              <ProgressRow label="Carbs" value={carbs} prevValue={prev?.carbs} color={carbsColor} />
              <View style={styles.rowGap} />
              <ProgressRow label="Fat" value={fat} prevValue={prev?.fat} color={fatColor} />
            </View>
          </View>
        </Card>
        <Animated.View style={[styles.pressOverlay, backgroundAnimatedStyle]} pointerEvents="none" />
      </Animated.View>
    </Pressable>
  );
}

function createStyles(colors: any, themeObj: any, scheme: "light" | "dark") {
  return StyleSheet.create({
    cardContainer: {},
    card: {
      padding: themeObj.spacing.md,
      borderRadius: themeObj.components.cards.cornerRadius,
      backgroundColor:
        scheme === "dark" ? themeObj.components.cards.darkMode.backgroundColor : themeObj.components.cards.lightMode.backgroundColor,
      ...(scheme === "light"
        ? {
            shadowColor: "rgba(0,0,0,0.05)",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 12,
            elevation: 4,
          }
        : {}),
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: themeObj.spacing.md,
    },
    dateColumn: {
      width: 88,
      justifyContent: "center",
      alignItems: "flex-start",
      paddingVertical: themeObj.spacing.sm,
    },
    metricsColumn: {
      flex: 1,
    },
    rowGap: {
      height: themeObj.spacing.sm,
    },
    pressOverlay: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: themeObj.components.cards.cornerRadius,
    },
  });
}
