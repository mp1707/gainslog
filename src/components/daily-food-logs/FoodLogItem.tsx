import React from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { FoodLog, Favorite } from "@/types/models";
import { useTheme } from "@/theme/ThemeProvider";

interface FoodLogItemProps {
  item: FoodLog;
  onDelete: (log: FoodLog | Favorite) => void;
  onToggleFavorite: (log: FoodLog) => void;
  onEdit: (log: FoodLog | Favorite) => void;
  onLogAgain: (log: FoodLog | Favorite) => void;
  onSaveToFavorites: (log: FoodLog | Favorite) => void;
  onRemoveFromFavorites: (log: FoodLog | Favorite) => void;
}

export const FoodLogItem: React.FC<FoodLogItemProps> = ({
  item,
  onDelete,
  onToggleFavorite,
  onEdit,
  onLogAgain,
  onSaveToFavorites,
  onRemoveFromFavorites,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View 
      style={{ paddingHorizontal: theme.spacing.md }}
      layout={LinearTransition}
    >
      <SwipeToFunctions
        onDelete={() => onDelete(item)}
        onFavorite={() => onToggleFavorite(item)}
        onTap={() => onEdit(item)}
      >
        <LogCard
          foodLog={item}
          isLoading={item.isEstimating}
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