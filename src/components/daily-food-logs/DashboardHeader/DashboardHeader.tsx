import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  Dimensions,
  UIManager,
} from "react-native";
import { Canvas, Circle, Path, Skia, Group } from "@shopify/react-native-skia";
import Animated, {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { Colors, Theme, useTheme } from "@/theme";
import { AppText, Button } from "@/components";
import { useAppStore } from "@/store/useAppStore";
import { formatDateToLocalString } from "@/utils/dateHelpers";
import {
  ChevronDown,
  Droplet,
  Flame,
  BicepsFlexed,
  Wheat,
} from "lucide-react-native";
import { ProgressRings } from "@/components/shared/ProgressRings";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Interfaces and Configs remain the same
interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
interface NutrientSummaryProps {
  percentages: NutrientValues;
  targets: NutrientValues;
  totals: NutrientValues;
}

interface NutrientValues {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}
interface ProgressRingsProps {
  percentages: NutrientValues;
  size?: number;
  strokeWidth?: number;
  spacing?: number;
}
const RING_CONFIG = [
  { key: "calories", colorKey: "calories" as const, label: "Calories" },
  { key: "protein", colorKey: "protein" as const, label: "Protein" },
  { key: "carbs", colorKey: "carbs" as const, label: "Carbs" },
  { key: "fat", colorKey: "fat" as const, label: "Fat" },
] as const;
const STROKE_WIDTH = 16;
const RING_SPACING = 2;

// Helper components remain the same
const getIcon = (label: string, color: string) => {
  switch (label) {
    case "Calories":
      return <Flame size={20} color={color} fill={color} strokeWidth={0} />;
    case "Protein":
      return (
        <BicepsFlexed size={20} color={color} fill={color} strokeWidth={0} />
      );
    case "Carbs":
      return <Wheat size={20} color={color} fill={color} strokeWidth={0} />;
    case "Fat":
      return <Droplet size={20} color={color} fill={color} strokeWidth={0} />;
    default:
      return null;
  }
};
const StatRow = ({
  color,
  label,
  current,
  total,
  unit,
}: {
  color: string;
  label: string;
  current: number;
  total: number;
  unit: string;
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  return (
    <View style={styles.statRow}>
      <View
        style={[styles.statIconBackground, { backgroundColor: color + "20" }]}
      >
        {getIcon(label, color)}
      </View>
      <View style={styles.statTextContainer}>
        <AppText style={styles.statLabel}>{label}</AppText>
        <View style={styles.statValues}>
          <AppText style={styles.statCurrentValue}>
            {Math.round(current)}
          </AppText>
          <AppText style={styles.statTotalValue}>
            {" "}
            / {Math.round(total)}
            {unit}
          </AppText>
        </View>
      </View>
    </View>
  );
};

// --- MAIN HEADER COMPONENT ---
export const DashboardHeader: React.FC<NutrientSummaryProps> = ({
  percentages,
  targets,
  totals,
}) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate } = useAppStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Animation values for popover
  const popoverScale = useSharedValue(0.9);
  const popoverOpacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  // Animated styles for popover
  const animatedPopoverStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popoverScale.value }],
    opacity: popoverOpacity.value,
  }));

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // Logic and animations
  const handleDateChange = (_: any, date?: Date) => {
    if (date) {
      Haptics.selectionAsync();
      setSelectedDate(formatDateToLocalString(date));
    }
    closeDatePicker();
  };

  const openDatePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowDatePicker(true);
    // Animate in
    backdropOpacity.value = withTiming(0.4, { duration: 200 });
    popoverOpacity.value = withTiming(1, { duration: 200 });
    popoverScale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
      overshootClamping: false,
    });
  };

  const closeDatePicker = () => {
    // Animate out
    backdropOpacity.value = withTiming(0, { duration: 150 });
    popoverOpacity.value = withTiming(0, { duration: 150 });
    popoverScale.value = withTiming(0.95, { duration: 150 });
    // Close modal after animation
    setTimeout(() => setShowDatePicker(false), 150);
  };

  const toggleDatePicker = () => {
    if (showDatePicker) {
      closeDatePicker();
    } else {
      openDatePicker();
    }
  };
  const formattedDate = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (selectedDate === formatDateToLocalString(today)) return "Today";
    if (selectedDate === formatDateToLocalString(yesterday)) return "Yesterday";
    return new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });
  }, [selectedDate]);

  const containerSize = 175;
  const center = containerSize / 2;
  const progress = useSharedValue({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useEffect(() => {
    const safePercentages = {
      calories: percentages.calories || 0,
      protein: percentages.protein || 0,
      carbs: percentages.carbs || 0,
      fat: percentages.fat || 0,
    };
    const targetValues = {
      calories: Math.min(1, Math.max(0, safePercentages.calories / 100)),
      protein: Math.min(1, Math.max(0, safePercentages.protein / 100)),
      carbs: Math.min(1, Math.max(0, safePercentages.carbs / 100)),
      fat: Math.min(1, Math.max(0, safePercentages.fat / 100)),
    };
    progress.value = {
      calories: withDelay(0, withSpring(targetValues.calories)),
      protein: withDelay(100, withSpring(targetValues.protein)),
      carbs: withDelay(200, withSpring(targetValues.carbs)),
      fat: withDelay(300, withSpring(targetValues.fat)),
    };
  }, [percentages, progress]);

  const outerRadius = center - STROKE_WIDTH / 2;
  const ringRadii = useMemo(() => {
    const radii = [];
    let currentRadius = outerRadius;
    for (let i = 0; i < RING_CONFIG.length; i++) {
      radii.push(currentRadius);
      if (i < RING_CONFIG.length - 1)
        currentRadius -= STROKE_WIDTH + RING_SPACING;
    }
    return radii;
  }, [outerRadius]);

  const ringColors = {
    calories: colors.semantic.calories,
    protein: colors.semantic.protein,
    carbs: colors.semantic.carbs,
    fat: colors.semantic.fat,
  };
  const ringPaths = useMemo(
    () =>
      ringRadii.map((radius) => {
        const path = Skia.Path.Make();
        path.addCircle(center, center, radius);
        return path;
      }),
    [ringRadii, center]
  );

  const animatedPathEnd = {
    calories: useDerivedValue(() => progress.value.calories),
    protein: useDerivedValue(() => progress.value.protein),
    carbs: useDerivedValue(() => progress.value.carbs),
    fat: useDerivedValue(() => progress.value.fat),
  };

  // --- RENDER ---
  return (
    <View style={styles.plateContainer}>
      <View style={styles.contentContainer}>
        <View style={styles.titleHeader}>
          <AppText role="Title2">Summary</AppText>
          <Button
            onPress={toggleDatePicker}
            icon={
              <ChevronDown
                size={20}
                color={colors.secondaryText}
                strokeWidth={1.5}
              />
            }
            iconPosition="right"
            size="small"
            variant="secondary"
            accessibilityLabel={`Selected date: ${formattedDate}`}
            accessibilityHint="Opens date selection popover"
          >
            {formattedDate}
          </Button>
        </View>

        {/* Date Picker Popover */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={closeDatePicker}
        >
          {/* Backdrop */}
          <AnimatedPressable
            style={[styles.popoverBackdrop, animatedBackdropStyle]}
            onPress={closeDatePicker}
            accessibilityLabel="Close date picker"
            accessibilityRole="button"
          />

          {/* Popover Content */}
          <View style={styles.popoverContainer}>
            <Animated.View
              style={[styles.popoverContent, animatedPopoverStyle]}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
            >
              <DateTimePicker
                value={new Date(selectedDate + "T00:00:00")}
                mode="date"
                display="inline"
                onChange={handleDateChange}
                maximumDate={new Date()}
                {...(Platform.OS === "ios" && {
                  themeVariant: colorScheme,
                  accentColor: colors.accent,
                })}
              />
            </Animated.View>
          </View>
        </Modal>

        <View style={styles.summaryContent}>
          <ProgressRings
            percentages={percentages}
            size={containerSize}
            strokeWidth={STROKE_WIDTH}
            spacing={RING_SPACING}
          />
          <View style={styles.statsContainer}>
            {RING_CONFIG.map((config) => (
              <StatRow
                key={config.key}
                color={ringColors[config.colorKey]}
                label={config.label}
                current={totals[config.key] || 0}
                total={targets[config.key] || 0}
                unit={config.key === "calories" ? "kcal" : "g"}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

// --- STYLESHEET ---
const createStyles = (colors: Colors, theme: Theme) => {
  return StyleSheet.create({
    plateContainer: {
      backgroundColor: colors.secondaryBackground,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    contentContainer: {
      paddingHorizontal: theme.spacing.md,
    },
    titleHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: theme.spacing.md, // Use paddingTop instead of marginTop
    },
    summaryContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.lg,
      marginTop: theme.spacing.md,
    },
    ringsContainer: {},
    statsContainer: { flex: 1, gap: theme.spacing.sm },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    statIconBackground: { borderRadius: 100, padding: theme.spacing.sm },
    statTextContainer: { flex: 1 },
    statLabel: {
      ...theme.typography.Body,
      color: colors.secondaryText,
      marginBottom: 2,
    },
    statValues: { flexDirection: "row", alignItems: "baseline" },
    statCurrentValue: {
      ...theme.typography.Body,
      fontWeight: "600",
      color: colors.primaryText,
    },
    statTotalValue: {
      ...theme.typography.Caption,
      color: colors.secondaryText,
    },
    popoverBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      width: screenWidth,
      height: screenHeight,
    },
    popoverContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    popoverContent: {
      backgroundColor: colors.secondaryBackground,
      borderRadius: theme.spacing.md,
      padding: theme.spacing.sm,
      shadowColor: "rgba(0, 0, 0, 0.15)",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 1,
      shadowRadius: 24,
      elevation: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
  });
};
