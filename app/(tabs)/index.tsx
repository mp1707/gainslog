import React, { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScrollView, View } from "react-native";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import { useAppStore } from "@/store/useAppStore";
import { DateNavigationHeader } from "@/components/daily-food-logs/DateNavigationHeader";
import { NutrientSummary } from "@/components/daily-food-logs/NutrientSummary";
import { LogCard } from "@/components/daily-food-logs/LogCard";

export default function TodayTab() {
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { selectedDate, setSelectedDate, foodLogs, dailyTargets } = useAppStore();

  const dailyFoodLogs = useMemo(
    () => foodLogs.filter(log => log.logDate === selectedDate),
    [foodLogs, selectedDate]
  );

  const dailyTotals = useMemo(() => {
    return dailyFoodLogs.reduce(
      (totals, log) => ({
        calories: totals.calories + log.calories,
        protein: totals.protein + log.protein,
        carbs: totals.carbs + log.carbs,
        fat: totals.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [dailyFoodLogs]);

  const dailyPercentages = useMemo(() => {
    if (!dailyTargets) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    return {
      calories: dailyTargets.calories > 0 ? (dailyTotals.calories / dailyTargets.calories) * 100 : 0,
      protein: dailyTargets.protein > 0 ? (dailyTotals.protein / dailyTargets.protein) * 100 : 0,
      carbs: dailyTargets.carbs > 0 ? (dailyTotals.carbs / dailyTargets.carbs) * 100 : 0,
      fat: dailyTargets.fat > 0 ? (dailyTotals.fat / dailyTargets.fat) * 100 : 0,
    };
  }, [dailyTotals, dailyTargets]);

  const handleDateChange = (event: any, date?: Date) => {
    if (date) {
      const dateString = date.toISOString().split('T')[0];
      setSelectedDate(dateString);
    }
  };

  const handleNavigatePrevious = () => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() - 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const handleNavigateNext = () => {
    const currentDate = new Date(selectedDate + 'T00:00:00');
    currentDate.setDate(currentDate.getDate() + 1);
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const canGoNext = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate < today;
  }, [selectedDate]);

  const defaultTargets = { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: dynamicBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <DateNavigationHeader
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onNavigatePrevious={handleNavigatePrevious}
          onNavigateNext={handleNavigateNext}
          canGoNext={canGoNext}
        />
        
        <NutrientSummary
          percentages={dailyPercentages}
          targets={dailyTargets || defaultTargets}
          totals={dailyTotals}
        />

        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {dailyFoodLogs.map((foodLog) => (
            <LogCard key={foodLog.id} foodLog={foodLog} />
          ))}
        </View>
      </ScrollView>
    </GestureHandlerRootView>
  );
}
