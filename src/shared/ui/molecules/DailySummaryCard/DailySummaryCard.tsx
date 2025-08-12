import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  LinearTransition,
  FadeIn,
  FadeOut,
  ReduceMotion,
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
  const { colors, theme } = useTheme();

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

  // Subtle layout transition for height/size changes
  const layoutTransition = useMemo(
    () =>
      LinearTransition.springify()
        .damping(22)
        .stiffness(300)
        .reduceMotion(ReduceMotion.System),
    []
  );

  // Explicit height animation for the metrics column to guarantee smooth card size changes
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const heightSV = useSharedValue(0);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!didInitRef.current) {
      heightSV.value = measuredHeight;
      didInitRef.current = true;
      return;
    }
    heightSV.value = withSpring(measuredHeight, {
      damping: 22,
      stiffness: 300,
    });
  }, [measuredHeight]);

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: heightSV.value,
  }));

  const renderMetricsContent = () => (
    <>
      {visible?.calories && (
        <Animated.View
          entering={FadeIn.duration(
            theme.animations.defaultTransition.duration
          )}
          exiting={FadeOut.duration(
            theme.animations.defaultTransition.duration
          )}
          layout={layoutTransition}
        >
          <ProgressRow
            label="Calories"
            value={calories}
            color={caloriesColor}
          />
          {(visible?.protein || visible?.carbs || visible?.fat) && (
            <View style={styles.rowGap} />
          )}
        </Animated.View>
      )}
      {visible?.protein && (
        <Animated.View
          entering={FadeIn.duration(
            theme.animations.defaultTransition.duration
          )}
          exiting={FadeOut.duration(
            theme.animations.defaultTransition.duration
          )}
          layout={layoutTransition}
        >
          <ProgressRow label="Protein" value={protein} color={proteinColor} />
          {(visible?.carbs || visible?.fat) && <View style={styles.rowGap} />}
        </Animated.View>
      )}
      {visible?.carbs && (
        <Animated.View
          entering={FadeIn.duration(
            theme.animations.defaultTransition.duration
          )}
          exiting={FadeOut.duration(
            theme.animations.defaultTransition.duration
          )}
          layout={layoutTransition}
        >
          <ProgressRow label="Carbs" value={carbs} color={carbsColor} />
          {visible?.fat && <View style={styles.rowGap} />}
        </Animated.View>
      )}
      {visible?.fat && (
        <Animated.View
          entering={FadeIn.duration(
            theme.animations.defaultTransition.duration
          )}
          exiting={FadeOut.duration(
            theme.animations.defaultTransition.duration
          )}
          layout={layoutTransition}
        >
          <ProgressRow label="Fat" value={fat} color={fatColor} />
        </Animated.View>
      )}
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessible={true}
      accessibilityLabel={accessibility}
      accessibilityRole="button"
    >
      <Animated.View
        layout={layoutTransition}
        style={[styles.cardContainer, containerAnimatedStyle]}
      >
        <Animated.View layout={layoutTransition}>
          <Card>
            <Animated.View layout={layoutTransition} style={styles.row}>
              <View style={styles.dateColumn}>
                <AppText role="Headline">{formatDate(dateIso)}</AppText>
              </View>
              <View style={styles.metricsColumn}>
                {/* Measuring clone (offscreen) to get natural content height */}
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: -10000,
                    opacity: 0,
                  }}
                  pointerEvents="none"
                  onLayout={(e) =>
                    setMeasuredHeight(e.nativeEvent.layout.height)
                  }
                >
                  {renderMetricsContent()}
                </View>
                {/* Animated visible container */}
                <Animated.View
                  style={[animatedHeightStyle, { overflow: "hidden" }]}
                >
                  {renderMetricsContent()}
                </Animated.View>
              </View>
            </Animated.View>
          </Card>
        </Animated.View>
        <Animated.View
          style={[styles.pressOverlay, backgroundAnimatedStyle]}
          pointerEvents="none"
        />
      </Animated.View>
    </Pressable>
  );
}
