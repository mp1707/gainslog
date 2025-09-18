import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Text,
  TextStyle,
  View,
} from "react-native";
import Animated, {
  Easing as ReanimatedEasing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { AppText, Card } from "@/components";
import { useTheme } from "@/theme";
import type { Colors, Theme } from "@/theme";
import { createStyles } from "./MacrosCard.styles";
import { MacroLineLoader } from "./MacroLineLoader";

interface MacrosCardProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  // When true, dim numbers as stale
  processing?: boolean;
  // Changes to this key will trigger slot-machine style counters
  revealKey?: number;
}

// Utility to run a quick slot-machine then count-up animation via state
const useNumberReveal = (initial: number) => {
  const prevRef = useRef(initial);
  const [display, setDisplay] = useState(initial);

  const animateTo = (target: number) => {
    const startPrev = prevRef.current;
    prevRef.current = target;

    // Phase 1: slot-machine (random flicker ~250ms)
    const flickerDuration = 250;
    const flickerStep = 35;
    let elapsed = 0;
    const flicker = setInterval(() => {
      elapsed += flickerStep;
      setDisplay(Math.max(0, Math.round(target * Math.random())));
      if (elapsed >= flickerDuration) {
        clearInterval(flicker);
        // Phase 2: count-up/down to target (~450ms)
        const total = 450;
        const start = Date.now();
        const from = isNaN(startPrev) ? 0 : startPrev;
        const tick = () => {
          const t = Math.min(1, (Date.now() - start) / total);
          const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
          const val = Math.round(from + (target - from) * eased);
          setDisplay(val);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, flickerStep);
  };

  return { display, animateTo } as const;
};

interface MacroRowProps {
  item: {
    key: string;
    label: string;
    color: string;
    value: string;
  };
  index: number;
  processing: boolean;
  styles: ReturnType<typeof createStyles>;
  valueTextStyle: TextStyle;
  colors: Colors;
  theme: Theme;
}

const MacroRow = ({
  item,
  index,
  processing,
  styles,
  valueTextStyle,
  colors,
  theme,
}: MacroRowProps) => {
  const [rowWidth, setRowWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(theme.spacing.lg + theme.spacing.xs);

  const rowWidthValue = useSharedValue(0);
  const slideDistance = useSharedValue(theme.spacing.xl);
  const transition = useSharedValue(processing ? 1 : 0);
  const loaderOpacity = useSharedValue(processing ? 1 : 0);
  const valueOpacity = useSharedValue(processing ? 0 : 1);

  const handleRowLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width !== rowWidth) {
        setRowWidth(width);
      }
      const nextHeight = Math.max(height, theme.spacing.lg + theme.spacing.xs);
      if (nextHeight !== rowHeight) {
        setRowHeight(nextHeight);
      }
      rowWidthValue.value = width;
      slideDistance.value = Math.max(theme.spacing.xl, width * 0.18);
    },
    [rowHeight, rowWidth, rowWidthValue, slideDistance, theme.spacing.lg, theme.spacing.xl, theme.spacing.xs],
  );

  useEffect(() => {
    if (processing) {
      valueOpacity.value = withTiming(0, {
        duration: 120,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      });
      loaderOpacity.value = withTiming(1, {
        duration: 200,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      });
      transition.value = withTiming(1, {
        duration: 320,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.cubic),
      });
    } else {
      transition.value = withTiming(0, {
        duration: 420,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      });
      loaderOpacity.value = withDelay(
        260,
        withTiming(0, {
          duration: 140,
          easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
        }),
      );
      valueOpacity.value = withDelay(
        260,
        withTiming(1, {
          duration: 280,
          easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
        }),
      );
    }
  }, [loaderOpacity, processing, transition, valueOpacity]);

  const loaderHeight = Math.max(rowHeight, theme.spacing.lg + theme.spacing.xs);

  const loaderAnimatedStyle = useAnimatedStyle(() => {
    const calculatedWidth = Math.max(rowWidthValue.value * transition.value, 0);
    return {
      opacity: loaderOpacity.value,
      width: calculatedWidth,
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - transition.value,
    transform: [
      {
        translateX: transition.value * slideDistance.value,
      },
    ],
  }));

  const valueAnimatedStyle = useAnimatedStyle(() => ({
    opacity: valueOpacity.value,
    transform: [
      {
        translateX: transition.value * slideDistance.value * 0.35,
      },
    ],
  }));

  return (
    <View style={styles.macroRow} onLayout={handleRowLayout}>
      <Animated.View
        pointerEvents="none"
        style={[styles.macroLoaderLayer, loaderAnimatedStyle]}
      >
        {rowWidth > 0 ? (
          <MacroLineLoader
            width={rowWidth}
            height={loaderHeight}
            color={item.color}
            index={index}
          />
        ) : (
          <View style={styles.macroLoaderPlaceholder} />
        )}
      </Animated.View>
      <Animated.View
        style={[
          styles.macroLabelContainer,
          labelAnimatedStyle,
          {
            backgroundColor: colors.secondaryBackground,
            paddingHorizontal: theme.spacing.xs,
            borderRadius: theme.spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.macroDot,
            { backgroundColor: item.color },
          ]}
        />
        <AppText>{item.label}</AppText>
      </Animated.View>
      <Animated.View style={[styles.macroValueContainer, valueAnimatedStyle]}>
        <Text style={valueTextStyle} numberOfLines={1}>
          {item.value}
        </Text>
      </Animated.View>
    </View>
  );
};

export const MacrosCard: React.FC<MacrosCardProps> = ({
  calories,
  protein,
  carbs,
  fat,
  processing = false,
  revealKey,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  const cals = useNumberReveal(calories ?? 0);
  const prot = useNumberReveal(protein ?? 0);
  const crb = useNumberReveal(carbs ?? 0);
  const ft = useNumberReveal(fat ?? 0);

  // On reveal key changes, animate to target values
  useEffect(() => {
    cals.animateTo(calories ?? 0);
    prot.animateTo(protein ?? 0);
    crb.animateTo(carbs ?? 0);
    ft.animateTo(fat ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey]);

  const valueTextStyle: TextStyle = {
    ...theme.typography.Body,
    color: colors.secondaryText,
    textAlign: "right",
  };

  const macroItems = useMemo(
    () => [
      {
        key: "calories",
        label: "Calories",
        color: colors.semantic.calories,
        value: `${cals.display} kcal`,
      },
      {
        key: "protein",
        label: "Protein",
        color: colors.semantic.protein,
        value: `${prot.display} g`,
      },
      {
        key: "carbs",
        label: "Carbs",
        color: colors.semantic.carbs,
        value: `${crb.display} g`,
      },
      {
        key: "fat",
        label: "Fat",
        color: colors.semantic.fat,
        value: `${ft.display} g`,
      },
    ],
    [
      cals.display,
      prot.display,
      crb.display,
      ft.display,
      colors.semantic.calories,
      colors.semantic.protein,
      colors.semantic.carbs,
      colors.semantic.fat,
    ],
  );

  return (
    <Card>
      <AppText role="Caption" style={styles.sectionHeader}>
        MACROS
      </AppText>
      {macroItems.map((item, index) => (
        <React.Fragment key={item.key}>
          <MacroRow
            item={item}
            index={index}
            processing={processing}
            styles={styles}
            valueTextStyle={valueTextStyle}
            colors={colors}
            theme={theme}
          />
          {index < macroItems.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </Card>
  );
};
