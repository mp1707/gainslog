import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, TextInput, View } from "react-native";
import Animated, {
  Easing as ReanimatedEasing,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { AppText, Card } from "@/components";
import { Button } from "@/components/shared/Button/Button";
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
  // New props for stale state
  hasUnsavedChanges?: boolean;
  changesCount?: number;
  onRecalculate?: () => void;
}

// Optimized utility using Reanimated - runs on UI thread without re-renders
const useNumberReveal = (initial: number) => {
  const prevRef = useRef(initial);
  const targetValue = useSharedValue(initial);
  const flickerProgress = useSharedValue(0);
  const countProgress = useSharedValue(0);

  // Derived value for the display number - all calculations on UI thread
  const displayValue = useDerivedValue(() => {
    'worklet';
    const target = targetValue.value;

    // During flicker phase (0-1), show random values
    if (flickerProgress.value < 1) {
      // Generate pseudo-random flicker based on progress
      const seed = Math.floor(flickerProgress.value * 10);
      const randomFactor = (seed * 9301 + 49297) % 233280 / 233280;
      return Math.max(0, Math.round(target * randomFactor));
    }

    // During count phase, interpolate from previous to target
    const from = prevRef.current;
    const t = countProgress.value;
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    return Math.round(from + (target - from) * eased);
  }, []);

  const animateTo = (target: number) => {
    const startPrev = prevRef.current;
    prevRef.current = target;
    targetValue.value = target;

    // Reset progress values
    flickerProgress.value = 0;
    countProgress.value = 0;

    // Phase 1: Flicker animation (250ms)
    flickerProgress.value = withTiming(1, {
      duration: 250,
      easing: ReanimatedEasing.linear,
    }, (finished) => {
      'worklet';
      if (finished) {
        // Phase 2: Count-up animation (450ms)
        countProgress.value = withTiming(1, {
          duration: 450,
          easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
        });
      }
    });
  };

  return { displayValue, animateTo } as const;
};

// Create animated text input component
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

// Component to display animated numbers - runs entirely on UI thread
const AnimatedNumber = React.memo(({ value, suffix, styles }: {
  value: Animated.SharedValue<number>,
  suffix: string,
  styles: any
}) => {
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return {
      value: `${Math.round(value.value)} ${suffix}`,
    } as any; // Type assertion to bypass TextInput readonly restriction
  });

  return (
    <AnimatedTextInput
      editable={false}
      value={`0 ${suffix}`}
      animatedProps={animatedProps}
      style={[styles.animatedNumberText, { color: 'inherit' }]}
    />
  );
});

interface MacroRowProps {
  item: {
    key: string;
    label: string;
    color: string;
    value: Animated.SharedValue<number>;
    suffix: string;
  };
  index: number;
  processing: boolean;
  styles: ReturnType<typeof createStyles>;
  colors: Colors;
  theme: Theme;
}

const MacroRowComponent = ({
  item,
  index,
  processing,
  styles,
  colors,
  theme,
}: MacroRowProps) => {
  const [rowWidth, setRowWidth] = useState(0);
  const [rowHeight, setRowHeight] = useState(theme.spacing.lg + theme.spacing.xs);

  // Single shared value for all animations - others derived from this
  const transition = useSharedValue(processing ? 1 : 0);
  const rowWidthValue = useSharedValue(0);

  const handleRowLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      if (width !== rowWidth) {
        setRowWidth(width);
        rowWidthValue.value = width;
      }
      const nextHeight = Math.max(height, theme.spacing.lg + theme.spacing.xs);
      if (nextHeight !== rowHeight) {
        setRowHeight(nextHeight);
      }
    },
    [rowHeight, rowWidth, rowWidthValue, theme.spacing.lg, theme.spacing.xs],
  );

  useEffect(() => {
    if (processing) {
      transition.value = withTiming(1, {
        duration: 320,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.cubic),
      });
    } else {
      transition.value = withTiming(0, {
        duration: 420,
        easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
      });
    }
  }, [processing, transition]);

  const loaderHeight = Math.max(rowHeight, theme.spacing.lg + theme.spacing.xs);

  const loaderConfig = useMemo(() => {
    if (rowWidth <= 0) {
      return {
        density: 1,
        detail: 1.15,
        amplitude: 1,
      };
    }

    const normalizedWidth = Math.max(0, rowWidth - theme.spacing.xl * 4);
    const density = Math.min(2.6, 1 + normalizedWidth / 260);
    const detail = Math.min(3.2, Math.max(1.1, density * 1.18));
    const amplitude = Math.min(1.45, 1 + (density - 1) * 0.38);

    return {
      density,
      detail,
      amplitude,
    };
  }, [rowWidth, theme.spacing.xl]);

  const loaderAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const t = transition.value;
    const calculatedWidth = Math.max(rowWidthValue.value * t, 0);

    // Derive loader opacity from transition
    // Fast fade-in when loading (0->1), delayed fade-out when done (1->0)
    const loaderOpacity = t > 0.5 ? 1 : t * 2;

    return {
      opacity: loaderOpacity,
      width: calculatedWidth,
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const t = transition.value;
    const slideDistance = Math.max(theme.spacing.xl, rowWidthValue.value * 0.18);

    return {
      opacity: 1 - t,
      transform: [{ translateX: t * slideDistance }],
    };
  });

  const valueAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const t = transition.value;
    const slideDistance = Math.max(theme.spacing.xl, rowWidthValue.value * 0.18);

    // Derive value opacity from transition with delay effect
    // Stay hidden during loading (t > 0.4), then fade in
    const valueOpacity = t < 0.4 ? 1 : Math.max(0, (1 - t) / 0.6);

    return {
      opacity: valueOpacity,
      transform: [{ translateX: t * slideDistance * 0.35 }],
    };
  });

  return (
    <View style={styles.macroRow} onLayout={handleRowLayout}>
      <Animated.View
        pointerEvents="none"
        style={[styles.macroLoaderLayer, loaderAnimatedStyle]}
      >
        {processing && rowWidth > 0 ? (
          <MacroLineLoader
            width={rowWidth}
            height={loaderHeight}
            color={item.color}
            index={index}
            squiggleDensity={loaderConfig.density}
            detailDensity={loaderConfig.detail}
            amplitudeScale={loaderConfig.amplitude}
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
        <AnimatedNumber value={item.value} suffix={item.suffix} styles={styles} />
      </Animated.View>
    </View>
  );
};

// Memoized to prevent re-renders when parent updates
const MacroRow = React.memo(MacroRowComponent, (prev, next) => {
  // Only re-render if these specific props change
  return (
    prev.processing === next.processing &&
    prev.index === next.index &&
    prev.item.key === next.item.key &&
    prev.item.label === next.item.label &&
    prev.item.color === next.item.color &&
    prev.item.value === next.item.value && // Shared value reference
    prev.item.suffix === next.item.suffix &&
    prev.styles === next.styles &&
    prev.colors === next.colors &&
    prev.theme === next.theme
  );
});

export const MacrosCard: React.FC<MacrosCardProps> = ({
  calories,
  protein,
  carbs,
  fat,
  processing = false,
  revealKey,
  hasUnsavedChanges = false,
  changesCount = 0,
  onRecalculate,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const cals = useNumberReveal(calories ?? 0);
  const prot = useNumberReveal(protein ?? 0);
  const crb = useNumberReveal(carbs ?? 0);
  const ft = useNumberReveal(fat ?? 0);

  // On reveal key changes, animate to target values with staggered delays
  useEffect(() => {
    // Stagger animations by 50ms each to spread computational load
    cals.animateTo(calories ?? 0);
    setTimeout(() => prot.animateTo(protein ?? 0), 50);
    setTimeout(() => crb.animateTo(carbs ?? 0), 100);
    setTimeout(() => ft.animateTo(fat ?? 0), 150);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealKey]);

  // Use ref for stable array reference - shared values update automatically
  const macroItemsRef = useRef([
    {
      key: "calories",
      label: "Calories",
      color: colors.semantic.calories,
      value: cals.displayValue,
      suffix: "kcal",
    },
    {
      key: "protein",
      label: "Protein",
      color: colors.semantic.protein,
      value: prot.displayValue,
      suffix: "g",
    },
    {
      key: "carbs",
      label: "Carbs",
      color: colors.semantic.carbs,
      value: crb.displayValue,
      suffix: "g",
    },
    {
      key: "fat",
      label: "Fat",
      color: colors.semantic.fat,
      value: ft.displayValue,
      suffix: "g",
    },
  ]);

  // Update only colors when theme changes
  useEffect(() => {
    macroItemsRef.current[0].color = colors.semantic.calories;
    macroItemsRef.current[1].color = colors.semantic.protein;
    macroItemsRef.current[2].color = colors.semantic.carbs;
    macroItemsRef.current[3].color = colors.semantic.fat;
  }, [colors.semantic.calories, colors.semantic.protein, colors.semantic.carbs, colors.semantic.fat]);

  const handleRecalculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRecalculate?.();
  };

  const recalculateLabel = useMemo(() => {
    const changeWord = changesCount === 1 ? "change" : "changes";
    return `Recalculate (${changesCount} ${changeWord})`;
  }, [changesCount]);

  return (
    <Card style={styles.cardContainer}>
      <AppText role="Caption" style={styles.sectionHeader}>
        MACROS
      </AppText>
      {macroItemsRef.current.map((item, index) => (
        <React.Fragment key={item.key}>
          <MacroRow
            item={item}
            index={index}
            processing={processing}
            styles={styles}
            colors={colors}
            theme={theme}
          />
          {index < macroItemsRef.current.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}

      {/* Stale State Overlay */}
      {hasUnsavedChanges && !processing && (
        <View style={styles.blurOverlay}>
          <BlurView
            intensity={8}
            tint={colorScheme}
            style={styles.blurView}
          >
            <View style={styles.recalculateButtonContainer}>
              <Button
                label={recalculateLabel}
                variant="primary"
                onPress={handleRecalculate}
                disabled={processing}
              />
            </View>
          </BlurView>
        </View>
      )}
    </Card>
  );
};
