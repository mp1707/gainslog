import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  processing?: boolean;
  revealKey?: number;
  hasUnsavedChanges?: boolean;
  changesCount?: number;
  foodComponentsCount?: number;
  onRecalculate?: () => void;
}

type MacroSharedValue = Animated.SharedValue<number>;

type StaticMacroItem = {
  key: string;
  label: string;
  color: string;
  value: number;
  suffix: string;
};

const normalizeMacro = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

// Optimized utility using Reanimated - runs on UI thread without re-renders
const useNumberReveal = (initial: number) => {
  const prevValue = useSharedValue(initial);
  const targetValue = useSharedValue(initial);
  const flickerProgress = useSharedValue(0);
  const countProgress = useSharedValue(0);

  // Derived value for the display number - all calculations on UI thread
  const displayValue = useDerivedValue(() => {
    "worklet";
    const target = targetValue.value;

    if (flickerProgress.value < 1) {
      const seed = Math.floor(flickerProgress.value * 10);
      const randomFactor = ((seed * 9301 + 49297) % 233280) / 233280;
      return Math.max(0, Math.round(target * randomFactor));
    }

    const from = prevValue.value;
    const t = countProgress.value;
    const eased = 1 - Math.pow(1 - t, 3);
    return Math.round(from + (target - from) * eased);
  }, []);

  const animateTo = (target: number) => {
    prevValue.value = targetValue.value;
    targetValue.value = target;

    flickerProgress.value = 0;
    countProgress.value = 0;

    flickerProgress.value = withTiming(
      1,
      {
        duration: 250,
        easing: ReanimatedEasing.linear,
      },
      (finished) => {
        "worklet";
        if (finished) {
          countProgress.value = withTiming(1, {
            duration: 450,
            easing: ReanimatedEasing.out(ReanimatedEasing.cubic),
          });
        }
      }
    );
  };

  return { displayValue, animateTo } as const;
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const AnimatedNumber = React.memo(
  ({
    value,
    suffix,
    styles,
  }: {
    value: MacroSharedValue;
    suffix: string;
    styles: ReturnType<typeof createStyles>;
  }) => {
    const frameCount = useSharedValue(0);

    const animatedProps = useAnimatedProps(() => {
      "worklet";
      frameCount.value += 1;
      const shouldUpdate = frameCount.value % 2 === 0;

      if (!shouldUpdate && frameCount.value > 2) {
        return {} as any;
      }

      return {
        text: `${Math.round(value.value)} ${suffix}`,
      } as any;
    });

    return (
      <AnimatedTextInput
        editable={false}
        underlineColorAndroid="transparent"
        defaultValue={`0 ${suffix}`}
        animatedProps={animatedProps}
        style={[styles.animatedNumberText]}
      />
    );
  }
);

interface MacroRowProps {
  item: {
    key: string;
    label: string;
    color: string;
    value: MacroSharedValue;
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
  const [rowHeight, setRowHeight] = useState(
    theme.spacing.lg + theme.spacing.xs
  );

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
    [rowHeight, rowWidth, rowWidthValue, theme.spacing.lg, theme.spacing.xs]
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
    "worklet";
    const t = transition.value;
    const calculatedWidth = Math.max(rowWidthValue.value * t, 0);

    const loaderOpacity = t > 0.5 ? 1 : t * 2;

    return {
      opacity: loaderOpacity,
      width: calculatedWidth,
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    "worklet";
    const t = transition.value;
    const slideDistance = Math.max(
      theme.spacing.xl,
      rowWidthValue.value * 0.18
    );

    return {
      opacity: 1 - t,
      transform: [{ translateX: t * slideDistance }],
    };
  });

  const valueAnimatedStyle = useAnimatedStyle(() => {
    "worklet";
    const t = transition.value;
    const slideDistance = Math.max(
      theme.spacing.xl,
      rowWidthValue.value * 0.18
    );

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
        <View style={[styles.macroDot, { backgroundColor: item.color }]} />
        <AppText>{item.label}</AppText>
      </Animated.View>
      <Animated.View style={[styles.macroValueContainer, valueAnimatedStyle]}>
        <AnimatedNumber value={item.value} suffix={item.suffix} styles={styles} />
      </Animated.View>
    </View>
  );
};

const MacroRow = React.memo(MacroRowComponent, (prev, next) => {
  return (
    prev.processing === next.processing &&
    prev.index === next.index &&
    prev.item.key === next.item.key &&
    prev.item.label === next.item.label &&
    prev.item.color === next.item.color &&
    prev.item.value === next.item.value &&
    prev.item.suffix === next.item.suffix &&
    prev.styles === next.styles &&
    prev.colors === next.colors &&
    prev.theme === next.theme
  );
});

interface AnimatedMacrosContentProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  processing: boolean;
  revealKey?: number;
  styles: ReturnType<typeof createStyles>;
  colors: Colors;
  theme: Theme;
}

const AnimatedMacrosContent: React.FC<AnimatedMacrosContentProps> = React.memo(
  ({
    calories,
    protein,
    carbs,
    fat,
    processing,
    revealKey,
    styles,
    colors,
    theme,
  }) => {
    const cals = useNumberReveal(calories);
    const prot = useNumberReveal(protein);
    const crb = useNumberReveal(carbs);
    const ft = useNumberReveal(fat);

    useEffect(() => {
      const timers: Array<ReturnType<typeof setTimeout>> = [];

      cals.animateTo(calories);
      timers.push(
        setTimeout(() => prot.animateTo(protein), 50)
      );
      timers.push(
        setTimeout(() => crb.animateTo(carbs), 100)
      );
      timers.push(
        setTimeout(() => ft.animateTo(fat), 150)
      );

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [revealKey, calories, protein, carbs, fat]);

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

    useEffect(() => {
      macroItemsRef.current[0].color = colors.semantic.calories;
      macroItemsRef.current[1].color = colors.semantic.protein;
      macroItemsRef.current[2].color = colors.semantic.carbs;
      macroItemsRef.current[3].color = colors.semantic.fat;
    }, [
      colors.semantic.calories,
      colors.semantic.protein,
      colors.semantic.carbs,
      colors.semantic.fat,
    ]);

    return (
      <>
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
            {index < macroItemsRef.current.length - 1 && (
              <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </>
    );
  }
);

const StaticMacrosContent: React.FC<{
  items: StaticMacroItem[];
  styles: ReturnType<typeof createStyles>;
}> = React.memo(({ items, styles }) => (
  <>
    {items.map((item, index) => (
      <React.Fragment key={item.key}>
        <View style={styles.macroRow}>
          <View style={styles.macroLabelContainer}>
            <View style={[styles.macroDot, { backgroundColor: item.color }]} />
            <AppText>{item.label}</AppText>
          </View>
          <View style={styles.macroValueContainer}>
            <AppText color="secondary" style={styles.staticValueText}>
              {item.value} {item.suffix}
            </AppText>
          </View>
        </View>
        {index < items.length - 1 && <View style={styles.divider} />}
      </React.Fragment>
    ))}
  </>
));

export const MacrosCard: React.FC<MacrosCardProps> = ({
  calories,
  protein,
  carbs,
  fat,
  processing = false,
  revealKey,
  hasUnsavedChanges = false,
  changesCount = 0,
  foodComponentsCount = 0,
  onRecalculate,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const normalizedValues = useMemo(
    () => ({
      calories: normalizeMacro(calories),
      protein: normalizeMacro(protein),
      carbs: normalizeMacro(carbs),
      fat: normalizeMacro(fat),
    }),
    [calories, protein, carbs, fat]
  );

  const [isRevealActive, setIsRevealActive] = useState(false);
  const revealKeyRef = useRef(revealKey);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (revealKeyRef.current === revealKey) {
      return;
    }

    revealKeyRef.current = revealKey;

    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    if (revealKey === undefined) {
      setIsRevealActive(false);
      return;
    }

    setIsRevealActive(true);
    const timeout = setTimeout(() => {
      revealTimeoutRef.current = null;
      setIsRevealActive(false);
    }, 900);

    revealTimeoutRef.current = timeout;

    return () => {
      clearTimeout(timeout);
    };
  }, [revealKey]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  const staticItems = useMemo<StaticMacroItem[]>(
    () => [
      {
        key: "calories",
        label: "Calories",
        color: colors.semantic.calories,
        value: Math.round(normalizedValues.calories),
        suffix: "kcal",
      },
      {
        key: "protein",
        label: "Protein",
        color: colors.semantic.protein,
        value: Math.round(normalizedValues.protein),
        suffix: "g",
      },
      {
        key: "carbs",
        label: "Carbs",
        color: colors.semantic.carbs,
        value: Math.round(normalizedValues.carbs),
        suffix: "g",
      },
      {
        key: "fat",
        label: "Fat",
        color: colors.semantic.fat,
        value: Math.round(normalizedValues.fat),
        suffix: "g",
      },
    ],
    [
      colors.semantic.calories,
      colors.semantic.protein,
      colors.semantic.carbs,
      colors.semantic.fat,
      normalizedValues.calories,
      normalizedValues.protein,
      normalizedValues.carbs,
      normalizedValues.fat,
    ]
  );

  const isEmpty = foodComponentsCount === 0;
  const recalculateLabel = useMemo(() => {
    if (isEmpty) {
      return "Add items to calculate";
    }
    const changeWord = changesCount === 1 ? "change" : "changes";
    return `Recalculate (${changesCount} ${changeWord})`;
  }, [isEmpty, changesCount]);

  const useAnimatedVariant = processing || isRevealActive;

  const handleRecalculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRecalculate?.();
  };

  return (
    <Card style={styles.cardContainer}>
      <AppText role="Caption" style={styles.sectionHeader}>
        MACROS
      </AppText>

      {useAnimatedVariant ? (
        <AnimatedMacrosContent
          calories={normalizedValues.calories}
          protein={normalizedValues.protein}
          carbs={normalizedValues.carbs}
          fat={normalizedValues.fat}
          processing={processing}
          revealKey={revealKey}
          styles={styles}
          colors={colors}
          theme={theme}
        />
      ) : (
        <StaticMacrosContent items={staticItems} styles={styles} />
      )}

      {hasUnsavedChanges && !processing && (
        <View style={styles.blurOverlay}>
          <BlurView intensity={8} tint={colorScheme} style={styles.blurView}>
            <View style={styles.recalculateButtonContainer}>
              <Button
                label={recalculateLabel}
                variant="primary"
                onPress={handleRecalculate}
                disabled={processing || isEmpty}
              />
            </View>
          </BlurView>
        </View>
      )}
    </Card>
  );
};
