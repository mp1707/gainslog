import React, { useEffect } from "react";
import { View, Platform, TouchableOpacity } from "react-native";
import { CaretLeftIcon, CaretRightIcon } from "phosphor-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";
import { Card } from "../../../components/Card";
import { AppText } from "../../../components/AppText";
import { useTheme } from "../../../providers/ThemeProvider";
import { createStyles, getProgressColor } from "./FoodLogHeader.styles";
import { RadialProgressBar } from "../../../shared/ui/atoms/RadialProgressBar";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Define nutrient metadata for horizontal progress bars
const HORIZONTAL_NUTRIENT_META = {
  carbs: { label: "Kohlenhydrate:", unit: "g" },
  fat: { label: "Fett:", unit: "g" },
} as const;

// Local type for horizontal nutrition statistics
type HorizontalNutritionStat = {
  key: "carbs" | "fat";
  label: string;
  current: number;
  target: number;
  unit: string;
  percentage: number;
  color: "carbs" | "fat";
};

// Animated progress row component – encapsulates animation logic per row
const NutritionProgressRow: React.FC<{
  stat: HorizontalNutritionStat;
  styles: ReturnType<typeof createStyles>;
}> = ({ stat, styles }) => {
  // Shared value to drive width animations
  const progress = useSharedValue(stat.percentage);

  // Animate to new percentage whenever it updates
  useEffect(() => {
    progress.value = withTiming(stat.percentage, {
      duration: 500,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    });
  }, [stat.percentage]);

  // Animated style that converts the shared value into a percentage width
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View style={styles.nutritionRow}>
      {/* Label aligned right */}
      <AppText role="Headline" style={styles.nutritionLabel}>
        {stat.label} {stat.current}/{stat.target}
        {stat.unit}
      </AppText>

      {/* Progress bar with animated fill */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressBar,
              { backgroundColor: getProgressColor(stat.color) },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export const FoodLogHeader: React.FC = () => {
  const { selectedDate, setSelectedDate, getDailyProgress } = useFoodLogStore();
  const { colors, colorScheme } = useTheme();
  const styles = createStyles(colors);
  const dailyProgress = getDailyProgress();

  // Helper function to convert Date to local date string (YYYY-MM-DD)
  const dateToLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const dateString = dateToLocalDateString(selectedDate);
      setSelectedDate(dateString);
    }
  };

  const navigateToPreviousDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    const dateString = dateToLocalDateString(currentDate);
    setSelectedDate(dateString);
  };

  const navigateToNextDay = () => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    const dateString = dateToLocalDateString(currentDate);
    setSelectedDate(dateString);
  };

  // Check if the selected date is today to disable next button
  const isToday = () => {
    const today = new Date();
    const todayString = dateToLocalDateString(today);
    return selectedDate === todayString;
  };

  // Build nutrition stats for horizontal progress bars (carbs and fat only)
  const horizontalProgressStats = (["carbs", "fat"] as const).map((key) => {
    const meta =
      HORIZONTAL_NUTRIENT_META[key as keyof typeof HORIZONTAL_NUTRIENT_META];
    const currentVal = Math.round(
      dailyProgress.current[key as keyof typeof dailyProgress.current] as number
    );
    const targetVal = dailyProgress.targets[
      key as keyof typeof dailyProgress.targets
    ] as number;
    const perc = Math.min(
      100,
      dailyProgress.percentages[
        key as keyof typeof dailyProgress.percentages
      ] as number
    );
    return {
      key,
      label: meta.label,
      current: currentVal,
      target: targetVal,
      unit: meta.unit,
      percentage: perc,
      color: key as "carbs" | "fat",
    };
  });

  const caloriesData = {
    current: Math.round(dailyProgress.current.calories),
    target: dailyProgress.targets.calories,
    unit: "",
    label: "Calories",
  };

  const proteinData = {
    current: Math.round(dailyProgress.current.protein),
    target: dailyProgress.targets.protein,
    unit: "g",
    label: "Protein",
  };

  const fatData = {
    current: Math.round(dailyProgress.current.fat),
    target: dailyProgress.targets.fat,
    unit: "g",
    label: "Fat",
  };

  const carbsData = {
    current: Math.round(dailyProgress.current.carbs),
    target: dailyProgress.targets.carbs,
    unit: "g",
    label: "Carbs",
  };

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${dailyProgress.percentages.calories}%`,
  }));

  return (
    <View style={styles.cardWrapper}>
      <Card style={styles.card}>
        {/* Date Navigation Section */}
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity
            onPress={navigateToPreviousDay}
            style={styles.navigationArrow}
          >
            <CaretLeftIcon
              size={16}
              color={colors.secondaryText}
              weight="regular"
            />
          </TouchableOpacity>

          <View style={styles.datePickerContainer}>
            <DateTimePicker
              value={new Date(selectedDate)}
              mode="date"
              display={Platform.OS === "ios" ? "compact" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
              {...(Platform.OS === "ios" && {
                themeVariant: colorScheme,
                textColor: colors.primaryText,
                accentColor: colors.accent,
              })}
            />
          </View>

          <TouchableOpacity
            onPress={navigateToNextDay}
            style={[
              styles.navigationArrow,
              isToday() && styles.navigationArrowDisabled,
            ]}
            disabled={isToday()}
          >
            <CaretRightIcon
              size={16}
              color={isToday() ? colors.disabledText : colors.secondaryText}
              weight="regular"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.progressGrid}>
          <View style={styles.progressRow}>
            <View style={styles.nutritionRow}>
              <AppText role="Headline">{caloriesData.label}</AppText>
              <View style={styles.progressContainer}>
                <AppText role="Headline" style={styles.nutritionLabel}>
                  {caloriesData.current} / {caloriesData.target} kcal
                </AppText>
                <View style={styles.progressBackground}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      { backgroundColor: colors.accent },
                      animatedStyle,
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressItem}>
              <RadialProgressBar
                current={proteinData.current}
                target={proteinData.target}
                unit={proteinData.unit}
                label={proteinData.label}
                size={90}
              />
            </View>
            <View style={styles.progressItem}>
              <RadialProgressBar
                current={fatData.current}
                target={fatData.target}
                unit={fatData.unit}
                label={fatData.label}
                size={90}
              />
            </View>
            <View style={styles.progressItem}>
              <RadialProgressBar
                current={carbsData.current}
                target={carbsData.target}
                unit={carbsData.unit}
                label={carbsData.label}
                size={90}
              />
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
};
