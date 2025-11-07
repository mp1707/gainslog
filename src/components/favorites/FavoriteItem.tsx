import React from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
import { Favorite } from "@/types/models";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { useTheme } from "@/theme";

interface FavoriteItemProps {
  item: Favorite;
  onEdit: (favorite: Favorite) => void;
  onLogAgain: (favorite: Favorite) => void;
  onRemoveFromFavorites: (favorite: Favorite) => void;
  onDelete: (favorite: Favorite) => void;
}

export const FavoriteItem: React.FC<FavoriteItemProps> = ({
  item,
  onEdit,
  onLogAgain,
  onRemoveFromFavorites,
  onDelete,
}) => {
  const { theme } = useTheme();

  return (
    <Animated.View
      layout={LinearTransition}
      style={{ paddingHorizontal: theme.spacing.md }}
    >
      <SwipeToFunctions
        onDelete={() => onDelete(item)}
        onTap={() => onEdit(item)}
      >
        <LogCard
          foodLog={item}
          contextMenuPreset="favorites"
          onLogAgain={onLogAgain}
          onRemoveFromFavorites={onRemoveFromFavorites}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </SwipeToFunctions>
    </Animated.View>
  );
};
