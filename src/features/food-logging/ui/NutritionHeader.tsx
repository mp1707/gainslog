import React from "react";
import { View, Text, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";
import { styles, getProgressColor } from "./NutritionHeader.styles";

export const NutritionHeader: React.FC = () => {
  const { selectedDate, setSelectedDate, getDailyProgress } = useFoodLogStore();
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

  const nutritionStats = [
    {
      label: "Protein:",
      current: Math.round(dailyProgress.current.protein),
      target: dailyProgress.targets.protein,
      unit: "g",
      percentage: Math.min(100, dailyProgress.percentages.protein),
      color: "protein" as const,
    },
    {
      label: "Carb:",
      current: Math.round(dailyProgress.current.carbs),
      target: dailyProgress.targets.carbs,
      unit: "g",
      percentage: Math.min(100, dailyProgress.percentages.carbs),
      color: "carbs" as const,
    },
    {
      label: "Fat:",
      current: Math.round(dailyProgress.current.fat),
      target: dailyProgress.targets.fat,
      unit: "g",
      percentage: Math.min(100, dailyProgress.percentages.fat),
      color: "fat" as const,
    },
    {
      label: "Cal:",
      current: Math.round(dailyProgress.current.calories),
      target: dailyProgress.targets.calories,
      unit: "",
      percentage: Math.min(100, dailyProgress.percentages.calories),
      color: "calories" as const,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Nutrition Grid */}
        <View style={styles.nutritionGrid}>
          {nutritionStats.map((stat, index) => (
            <View key={stat.label} style={styles.nutritionItem}>
              <View style={styles.nutritionLabelContainer}>
                <Text style={styles.nutritionLabel}>{stat.label}</Text>
                <Text style={styles.nutritionValue} numberOfLines={1}>
                  {stat.current}/{stat.target}
                  {stat.unit}
                </Text>
              </View>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: getProgressColor(stat.color) },
                    { width: `${stat.percentage}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Date Picker */}
        <View style={styles.datePickerContainer}>
          <DateTimePicker
            value={new Date(selectedDate)}
            mode="date"
            display={Platform.OS === "ios" ? "compact" : "default"}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        </View>
      </View>
    </View>
  );
};
