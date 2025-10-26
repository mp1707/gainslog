import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { FoodLog, Favorite } from "@/types/models";
import { FoodLogItem } from "./FoodLogItem";
import { NutrientDashboard } from "./NutrientSummary/NutrientDashboard";
import { EmptyFoodLogsState } from "./EmptyFoodLogsState";
import { useTheme } from "@/theme/ThemeProvider";
import { hasDailyTargetsSet } from "@/utils";

const DEFAULT_TARGETS = { calories: 0, protein: 0, carbs: 0, fat: 0 };

interface FoodLogsListProps {
  foodLogs: FoodLog[];
  dailyPercentages: any;
  dailyTargets: any;
  dailyTotals: any;
  dynamicBottomPadding: number;
  headerOffset: number;
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
  headerOffset,
  onDelete,
  onToggleFavorite,
  onEdit,
  onLogAgain,
  onSaveToFavorites,
  onRemoveFromFavorites,
}) => {
  const { colors, theme } = useTheme();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  }, [foodLogs.length]);

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
      <NutrientDashboard
        percentages={dailyPercentages}
        targets={normalizedTargets}
        totals={dailyTotals}
      />
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
        marginTop: headerOffset,
      },
    ],
    [theme.spacing.md, dynamicBottomPadding, headerOffset]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={foodLogs}
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
    />
  );
};
