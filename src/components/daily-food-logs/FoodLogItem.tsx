import React from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Star } from "lucide-react-native";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { FoodLog, Favorite } from "@/types/models";
import { useTheme } from "@/theme/ThemeProvider";

interface FoodLogItemProps {
  item: FoodLog;
  isLoading?: boolean;
  onDelete: (log: FoodLog | Favorite) => void;
  onToggleFavorite: (log: FoodLog) => void;
  onEdit: (log: FoodLog | Favorite) => void;
  onLogAgain: (log: FoodLog | Favorite) => void;
  onSaveToFavorites: (log: FoodLog | Favorite) => void;
  onRemoveFromFavorites: (log: FoodLog | Favorite) => void;
}

export const FoodLogItem: React.FC<FoodLogItemProps> = ({
  item,
  isLoading,
  onDelete,
  onToggleFavorite,
  onEdit,
  onLogAgain,
  onSaveToFavorites,
  onRemoveFromFavorites,
}) => {
  const { theme } = useTheme();
  const isItemLoading = Boolean(isLoading ?? item.isEstimating);

  return (
    <Animated.View
      style={{ paddingHorizontal: theme.spacing.md }}
      layout={LinearTransition}
    >
      <SwipeToFunctions
        onDelete={isItemLoading ? undefined : () => onDelete(item)}
        onLeftFunction={
          isItemLoading ? undefined : () => onToggleFavorite(item)
        }
        leftIcon={isItemLoading ? undefined : <Star size={24} color="white" />}
        onTap={isItemLoading ? undefined : () => onEdit(item)}
      >
        <LogCard
          foodLog={item}
          isLoading={isItemLoading}
          onLogAgain={onLogAgain}
          onSaveToFavorites={onSaveToFavorites}
          onRemoveFromFavorites={onRemoveFromFavorites}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </SwipeToFunctions>
    </Animated.View>
  );
};
