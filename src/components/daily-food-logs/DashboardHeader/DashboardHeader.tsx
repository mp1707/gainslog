import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { Canvas, Circle, Path, Skia, Group } from "@shopify/react-native-skia";
import {
  useSharedValue,
  withSpring,
  withDelay,
  useDerivedValue,
} from "react-native-reanimated";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors, Theme, useTheme } from "@/theme";
import { AppText, Button } from "@/components";
import { useAppStore } from "@/store/useAppStore";
import { formatDateToLocalString } from "@/utils/dateHelpers";
import {
  BarbellIcon,
  BreadIcon,
  CaretDownIcon,
  DropIcon,
  FireIcon,
} from "phosphor-react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
    case "Calories": return <FireIcon size={20} color={color} weight="fill" />;
    case "Protein": return <BarbellIcon size={20} color={color} weight="fill" />;
    case "Carbs": return <BreadIcon size={20} color={color} weight="fill" />;
    case "Fat": return <DropIcon size={20} color={color} weight="fill" />;
    default: return null;
  }
};
const StatRow = ({ color, label, current, total, unit }: { color: string; label: string; current: number; total: number; unit: string; }) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  return (
    <View style={styles.statRow}>
      <View style={[styles.statIconBackground, { backgroundColor: color + "20" }]}>
        {getIcon(label, color)}
      </View>
      <View style={styles.statTextContainer}>
        <AppText style={styles.statLabel}>{label}</AppText>
        <View style={styles.statValues}>
          <AppText style={styles.statCurrentValue}>{Math.round(current)}</AppText>
          <AppText style={styles.statTotalValue}>{" "}/ {Math.round(total)}{unit}</AppText>
        </View>
      </View>
    </View>
  );
};

// --- MAIN HEADER COMPONENT ---
export const DashboardHeader: React.FC<NutrientSummaryProps> = ({ percentages, targets, totals }) => {
  const { colors, theme, colorScheme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate } = useAppStore();
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Logic and animations remain the same
  const handleDateChange = (_: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(formatDateToLocalString(date));
  };
  const toggleDatePicker = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowDatePicker(!showDatePicker);
  };
  const formattedDate = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (selectedDate === formatDateToLocalString(today)) return "Today";
    if (selectedDate === formatDateToLocalString(yesterday)) return "Yesterday";
    return new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }, [selectedDate]);
  
  const containerSize = 160;
  const center = containerSize / 2;
  const progress = useSharedValue({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    const safePercentages = { calories: percentages.calories || 0, protein: percentages.protein || 0, carbs: percentages.carbs || 0, fat: percentages.fat || 0 };
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
      if (i < RING_CONFIG.length - 1) currentRadius -= STROKE_WIDTH + RING_SPACING;
    }
    return radii;
  }, [outerRadius]);
  
  const ringColors = { calories: colors.semantic.calories, protein: colors.semantic.protein, carbs: colors.semantic.carbs, fat: colors.semantic.fat };
  const ringPaths = useMemo(() => ringRadii.map((radius) => {
    const path = Skia.Path.Make();
    path.addCircle(center, center, radius);
    return path;
  }), [ringRadii, center]);

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
          <Button onPress={toggleDatePicker} icon={<CaretDownIcon size={20} color={colors.secondaryText} />} iconPosition="right" size="small" variant="secondary">
            {formattedDate}
          </Button>
        </View>

        {showDatePicker && (
          <DateTimePicker value={new Date(selectedDate + "T00:00:00")} mode="date" display="inline" onChange={handleDateChange} maximumDate={new Date()} {...(Platform.OS === "ios" && { themeVariant: colorScheme, accentColor: colors.accent })} />
        )}

        <View style={styles.summaryContent}>
          <View style={styles.ringsContainer}>
            <Canvas style={{ width: containerSize, height: containerSize }}>
              <Group transform={[{ rotate: -Math.PI / 2 }]} origin={{ x: center, y: center }}>
                {RING_CONFIG.map((config, index) => (
                  <React.Fragment key={config.key}>
                    <Circle cx={center} cy={center} r={ringRadii[index]} color={colors.disabledBackground} style="stroke" strokeWidth={STROKE_WIDTH} opacity={0.5} />
                    <Path path={ringPaths[index]} color={ringColors[config.colorKey]} style="stroke" strokeWidth={STROKE_WIDTH} strokeCap="round" start={0} end={animatedPathEnd[config.key]} />
                  </React.Fragment>
                ))}
              </Group>
            </Canvas>
          </View>
          <View style={styles.statsContainer}>
            {RING_CONFIG.map((config) => (
              <StatRow key={config.key} color={ringColors[config.colorKey]} label={config.label} current={totals[config.key] || 0} total={targets[config.key] || 0} unit={config.key === "calories" ? "kcal" : "g"} />
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
    statRow: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
    statIconBackground: { borderRadius: 100, padding: theme.spacing.sm },
    statTextContainer: { flex: 1 },
    statLabel: { ...theme.typography.Body, color: colors.secondaryText, marginBottom: 2 },
    statValues: { flexDirection: "row", alignItems: "baseline" },
    statCurrentValue: { ...theme.typography.Body, fontWeight: "600", color: colors.primaryText },
    statTotalValue: { ...theme.typography.Caption, color: colors.secondaryText },
  });
};