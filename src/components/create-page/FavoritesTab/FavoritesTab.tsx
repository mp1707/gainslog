import React from "react";
import { ScrollView } from "react-native";
import { useTheme } from "@/theme";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs";
import type { Favorite } from "@/types/models";
import { createStyles } from "./FavoritesTab.styles";

interface FavoritesTabProps {
  filteredFavorites: Favorite[];
  onCreateFromFavorite: (favorite: Favorite) => void;
  onDeleteFavorite: (favoriteId: string) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  filteredFavorites,
  onCreateFromFavorite,
  onDeleteFavorite,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {filteredFavorites.map((favorite) => (
        <SwipeToFunctions
          key={favorite.id}
          onDelete={() => onDeleteFavorite(favorite.id)}
          onTap={() => onCreateFromFavorite(favorite)}
        >
          <LogCard key={favorite.id} foodLog={favorite} />
        </SwipeToFunctions>
      ))}
    </ScrollView>
  );
};