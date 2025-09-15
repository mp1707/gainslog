import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
import { LogCard } from "@/components/daily-food-logs";
import { SearchBar } from "@/components/shared/SearchBar/SearchBar";
import type { Favorite } from "@/types/models";
import { createStyles } from "./FavoritesTab.styles";

interface FavoritesTabProps {
  onCreateFromFavorite: (favorite: Favorite) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  onCreateFromFavorite,
}) => {
  const { colors, theme } = useTheme();
  const { favorites, deleteFavorite } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const styles = createStyles(colors, theme);

  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;
    return favorites.filter(
      (favorite) =>
        favorite.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        favorite.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [favorites, searchQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search favorites"
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredFavorites.map((favorite) => (
          <SwipeToFunctions
            key={favorite.id}
            onDelete={() => deleteFavorite(favorite.id)}
            onTap={() => onCreateFromFavorite(favorite)}
          >
            <LogCard
              key={favorite.id}
              foodLog={favorite}
              contextMenuPreset="favorites"
              onLogAgain={() => onCreateFromFavorite(favorite)}
              onRemoveFromFavorites={() => deleteFavorite(favorite.id)}
              onDelete={() => deleteFavorite(favorite.id)}
            />
          </SwipeToFunctions>
        ))}
      </ScrollView>
    </View>
  );
};
