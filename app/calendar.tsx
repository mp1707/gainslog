import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
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
import { useOptimizedNutritionData, generateMonthKeys } from "@/hooks/useOptimizedNutritionData";

interface MonthData {
  year: number;
  month: number;
  key: string;
}

const { width: screenWidth } = Dimensions.get('window');

export default function Calendar() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { selectedDate, setSelectedDate, foodLogs, dailyTargets } = useAppStore();
  const router = useRouter();

  // Get current selected date components
  const selectedDateObj = useMemo(() => new Date(selectedDate + "T00:00:00"), [selectedDate]);
  const currentYear = selectedDateObj.getFullYear();
  const currentMonth = selectedDateObj.getMonth() + 1;

  // Generate months array (6 months before current, up to current month only)
  const monthsData = useMemo((): MonthData[] => {
    const months: MonthData[] = [];
    const startDate = new Date(currentYear, currentMonth - 1 - 6, 1);
    
    for (let i = 0; i < 7; i++) {
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

  // Track the currently visible/active month for progress ring rendering
  const [activeMonth, setActiveMonth] = useState<{year: number; month: number}>({
    year: currentYear,
    month: currentMonth,
  });

  // Generate relevant month keys for optimized nutrition data calculation
  const relevantMonths = useMemo(() => {
    return generateMonthKeys(currentYear, currentMonth, 6);
  }, [currentYear, currentMonth]);

  // Use optimized nutrition data hook
  const { getDailyPercentages } = useOptimizedNutritionData(
    foodLogs,
    dailyTargets,
    relevantMonths
  );

  // Event handlers
  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const handleDateSelect = useCallback((dateKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(dateKey);
    router.back();
  }, [setSelectedDate, router]);

  // Handle viewable items change to track active month
  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0].item as MonthData;
      setActiveMonth({
        year: visibleItem.year,
        month: visibleItem.month,
      });
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  // Render month item for FlatList
  const renderMonthItem = useCallback(({ item }: { item: MonthData }) => {
    // Only show full progress rings for the currently active/visible month
    const isActiveMonth = item.year === activeMonth.year && item.month === activeMonth.month;
    
    return (
      <CalendarGrid
        year={item.year}
        month={item.month}
        selectedDate={selectedDate}
        getDailyPercentages={getDailyPercentages}
        onDateSelect={handleDateSelect}
        width={screenWidth}
        useSimplifiedRings={!isActiveMonth}
      />
    );
  }, [selectedDate, getDailyPercentages, handleDateSelect, activeMonth]);

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
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
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

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    calendarContainer: {
      flex: 1,
    },
  });