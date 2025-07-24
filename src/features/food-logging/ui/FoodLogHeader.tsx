import React, { useEffect } from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";
import { PageHeader } from "../../../shared/ui/molecules/PageHeader";
import { styles, getProgressColor } from "./FoodLogHeader.styles";

// Define nutrient metadata for easy mapping
const NUTRIENT_META = {
  protein: { label: "Protein:", unit: "g" },
  carbs: { label: "Carb:", unit: "g" },
  fat: { label: "Fat:", unit: "g" },
  calories: { label: "Cal:", unit: "" },
} as const;

export const FoodLogHeader: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    getDailyProgress,
    visibleNutritionKeys,
    loadVisibleNutritionKeys,
  } = useFoodLogStore();
  const dailyProgress = getDailyProgress();

  // Ensure visibility preferences are loaded (no-op if already loaded)
  useEffect(() => {
    loadVisibleNutritionKeys();
  }, []);

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

  // Build nutrition stats dynamically
  const nutritionStats = visibleNutritionKeys.map((key) => {
    const meta = NUTRIENT_META[key];
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
      color: key as "protein" | "carbs" | "fat" | "calories",
    };
  });

  return (
    <PageHeader>
      {/* Date Navigation Section */}
      <View style={styles.dateNavigationContainer}>
        <TouchableOpacity
          onPress={navigateToPreviousDay}
          style={styles.navigationArrow}
        >
          <FontAwesome name="chevron-left" size={16} color="#666" />
        </TouchableOpacity>

        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
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
          <FontAwesome
            name="chevron-right"
            size={16}
            color={isToday() ? "#ccc" : "#666"}
          />
        </TouchableOpacity>
      </View>

      {/* Nutrition List */}
      <View style={styles.nutritionList}>
        {nutritionStats.map((stat) => (
          <View key={stat.label} style={styles.nutritionRow}>
            {/* Label aligned right */}
            <Text style={styles.nutritionLabel}>{stat.label}</Text>

            {/* Progress bar with overlayed value */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: getProgressColor(stat.color),
                      width: `${stat.percentage}%`,
                    },
                  ]}
                />
                <Text style={styles.progressText} numberOfLines={1}>
                  {stat.current}/{stat.target}
                  {stat.unit}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </PageHeader>
  );
};
