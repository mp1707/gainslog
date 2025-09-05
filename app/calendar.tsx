import React, {
  useMemo,
  useCallback,
} from "react";
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { ModalHeader } from "@/components/daily-food-logs/ModalHeader";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { CalendarGrid } from "@/components/shared/DatePicker/components/CalendarGrid";
import type { FoodLog } from "@/types/models";

interface MonthData {
  year: number;
  month: number;
  key: string;
}

interface DailyNutritionData {
  [dateKey: string]: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const { width: screenWidth } = Dimensions.get('window');

export default function Calendar() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { selectedDate, setSelectedDate, foodLogs, dailyTargets } = useAppStore();
  const router = useRouter();

  // Get current selected date components
  const selectedDateObj = useMemo(() => new Date(selectedDate + "T00:00:00"), [selectedDate]);
  const currentYear = selectedDateObj.getFullYear();
  const currentMonth = selectedDateObj.getMonth() + 1;

  // Generate months array (6 months before and after current)
  const monthsData = useMemo((): MonthData[] => {
    const months: MonthData[] = [];
    const startDate = new Date(currentYear, currentMonth - 1 - 6, 1);
    
    for (let i = 0; i < 13; i++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        key: `${date.getFullYear()}-${date.getMonth() + 1}`,
      });
    }
    return months;
  }, [currentYear, currentMonth]);

  // Find initial scroll index
  const initialScrollIndex = useMemo(() => {
    return monthsData.findIndex(m => m.year === currentYear && m.month === currentMonth);
  }, [monthsData, currentYear, currentMonth]);

  // Calculate daily nutrition data from food logs
  const dailyNutritionData = useMemo((): DailyNutritionData => {
    const data: DailyNutritionData = {};
    
    foodLogs.forEach((log: FoodLog) => {
      if (!data[log.logDate]) {
        data[log.logDate] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      data[log.logDate].calories += log.calories;
      data[log.logDate].protein += log.protein;
      data[log.logDate].carbs += log.carbs;
      data[log.logDate].fat += log.fat;
    });
    
    return data;
  }, [foodLogs]);

  // Calculate percentages for progress rings
  const getDailyPercentages = useCallback((dateKey: string) => {
    const dayData = dailyNutritionData[dateKey];
    if (!dayData || !dailyTargets) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    return {
      calories: dailyTargets.calories ? (dayData.calories / dailyTargets.calories) * 100 : 0,
      protein: dailyTargets.protein ? (dayData.protein / dailyTargets.protein) * 100 : 0,
      carbs: dailyTargets.carbs ? (dayData.carbs / dailyTargets.carbs) * 100 : 0,
      fat: dailyTargets.fat ? (dayData.fat / dailyTargets.fat) * 100 : 0,
    };
  }, [dailyNutritionData, dailyTargets]);

  // Event handlers
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDateSelect = useCallback((dateKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(dateKey);
    router.back();
  }, [setSelectedDate, router]);

  // Render month item for FlatList
  const renderMonthItem = useCallback(({ item }: { item: MonthData }) => (
    <CalendarGrid
      year={item.year}
      month={item.month}
      selectedDate={selectedDate}
      getDailyPercentages={getDailyPercentages}
      onDateSelect={handleDateSelect}
      width={screenWidth}
    />
  ), [selectedDate, getDailyPercentages, handleDateSelect]);

  return (
    <View style={styles.container}>
      <ModalHeader leftButton={{ label: "Cancel", onPress: handleCancel }} />
      
      <View style={styles.calendarContainer}>
        <FlatList
          data={monthsData}
          renderItem={renderMonthItem}
          keyExtractor={(item) => item.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialScrollIndex}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
      </View>
    </View>
  );
}

const createStyles = (colors: any, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    calendarContainer: {
      flex: 1,
    },
  });