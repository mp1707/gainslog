import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { FlatList, ListRenderItem, ScrollView, View } from "react-native";
import { FoodLog, Favorite } from "@/types/models";
import { FoodLogItem } from "./FoodLogItem";
import { NutrientDashboard } from "./NutrientSummary/NutrientDashboard";
import { EmptyFoodLogsState } from "./EmptyFoodLogsState";
import { useTheme } from "@/theme/ThemeProvider";
import { hasDailyTargetsSet } from "@/utils";
import { DateSlider } from "../shared/DateSlider";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_TARGETS = { calories: 0, protein: 0, carbs: 0, fat: 0 };

interface FoodLogsListProps {
  foodLogs: FoodLog[];
  dailyPercentages: any;
  dailyTargets: any;
  dailyTotals: any;
  dynamicBottomPadding: number;
  selectedDate: string;
  shouldRenderFoodLogs: boolean;
  onDelete: (log: FoodLog | Favorite) => void;
  onToggleFavorite: (log: FoodLog) => void;
  onEdit: (log: FoodLog | Favorite) => void;
  onLogAgain: (log: FoodLog | Favorite) => void;
  onSaveToFavorites: (log: FoodLog | Favorite) => void;
  onRemoveFromFavorites: (log: FoodLog | Favorite) => void;
}

export const FoodLogsList: React.FC<FoodLogsListProps> = ({
  foodLogs,
  dailyPercentages,
  dailyTargets,
  dailyTotals,
  dynamicBottomPadding,
  selectedDate,
  onDelete,
  onToggleFavorite,
  onEdit,
  onLogAgain,
  onSaveToFavorites,
  onRemoveFromFavorites,
  shouldRenderFoodLogs,
}) => {
  const { colors, theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const prevDataRef = useRef({ length: foodLogs.length, date: selectedDate });

  useEffect(() => {
    const isSameDate = prevDataRef.current.date === selectedDate;
    const lengthIncreased = foodLogs.length > prevDataRef.current.length;

    // Only scroll when a log is created on the current date
    // Don't scroll when deleting or changing dates
    if (isSameDate && lengthIncreased) {
      flatListRef.current?.scrollToOffset({
        animated: true,
        offset: -insets.top, // Account for transparent header
      });
    }

    prevDataRef.current = { length: foodLogs.length, date: selectedDate };
  }, [foodLogs.length, selectedDate, insets.top]);

  const keyExtractor = useCallback((item: FoodLog) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: 120, // Estimated LogCard height including gap
      offset: 120 * index,
      index,
    }),
    []
  );

  const renderItem: ListRenderItem<FoodLog> = useCallback(
    ({ item }) => (
      <FoodLogItem
        item={item}
        isLoading={item.isEstimating}
        onDelete={onDelete}
        onToggleFavorite={onToggleFavorite}
        onEdit={onEdit}
        onLogAgain={onLogAgain}
        onSaveToFavorites={onSaveToFavorites}
        onRemoveFromFavorites={onRemoveFromFavorites}
      />
    ),
    [
      onDelete,
      onToggleFavorite,
      onEdit,
      onLogAgain,
      onSaveToFavorites,
      onRemoveFromFavorites,
    ]
  );

  const normalizedTargets = useMemo(
    () => dailyTargets || DEFAULT_TARGETS,
    [dailyTargets]
  );

  const shouldShowEmptyState = hasDailyTargetsSet(dailyTargets);

  const ListHeaderComponent = useMemo(
    () => (
      <View>
        <DateSlider />
        <NutrientDashboard
          percentages={dailyPercentages}
          targets={normalizedTargets}
          totals={dailyTotals}
        />
      </View>
    ),
    [dailyPercentages, normalizedTargets, dailyTotals]
  );

  const EmptyComponent = useMemo(
    () => (shouldShowEmptyState ? <EmptyFoodLogsState /> : null),
    [shouldShowEmptyState]
  );

  const contentContainerStyle = useMemo(
    () => [
      {
        gap: theme.spacing.md,
        paddingBottom: dynamicBottomPadding,
      },
    ],
    [theme.spacing.md, dynamicBottomPadding]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={shouldRenderFoodLogs ? foodLogs : undefined}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      style={{
        flex: 1,
        backgroundColor: colors.primaryBackground,
      }}
      contentContainerStyle={contentContainerStyle}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={EmptyComponent}
      showsVerticalScrollIndicator={false}
      removeClippedSubviews
      initialNumToRender={6}
      maxToRenderPerBatch={8}
      windowSize={7}
      updateCellsBatchingPeriod={50}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
};
