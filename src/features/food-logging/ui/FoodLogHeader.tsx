import React from "react";
import { View, Text, Platform, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFoodLogStore } from "../../../stores/useFoodLogStore";
import { PageHeader } from "../../../shared/ui/molecules/PageHeader";
import { styles, getProgressColor } from "./FoodLogHeader.styles";

export const FoodLogHeader: React.FC = () => {
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
            style={[styles.navigationArrow, isToday() && styles.navigationArrowDisabled]}
            disabled={isToday()}
          >
            <FontAwesome 
              name="chevron-right" 
              size={16} 
              color={isToday() ? "#ccc" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {/* Nutrition Grid */}
        <View style={styles.nutritionGrid}>
          {/* First Row: Protein and Carbs */}
          <View style={styles.nutritionRow}>
            {nutritionStats.slice(0, 2).map((stat) => (
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
          
          {/* Second Row: Fat and Calories */}
          <View style={styles.nutritionRow}>
            {nutritionStats.slice(2, 4).map((stat) => (
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
        </View>
    </PageHeader>
  );
};
