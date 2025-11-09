import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Favorite } from "@/types/models";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import {
  createLogAgainHandler,
  createRemoveFromFavoritesHandler,
  createDeleteHandler,
} from "@/utils/foodLogHandlers";
import { FavoriteItem } from "@/components/favorites/FavoriteItem";
import { AppText } from "@/components/index";
import { Colors, Theme, useTheme } from "@/theme";
import { useTranslation } from "react-i18next";

export default function FavoritesScreen() {
  const favorites = useAppStore((state) => state.favorites);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const addFoodLog = useAppStore((state) => state.addFoodLog);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);
  const favoritesSearchQuery = useAppStore(
    (state) => state.favoritesSearchQuery
  );

  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const filteredFavorites = useMemo(() => {
    const trimmedQuery = favoritesSearchQuery.trim().toLowerCase();

    if (!trimmedQuery) {
      return favorites;
    }

    const queryWords = trimmedQuery.split(/\s+/).filter(Boolean);

    if (queryWords.length === 0) {
      return favorites;
    }

    return favorites.filter((favorite) => {
      const haystack = `${favorite.title} ${favorite.foodComponents
        .map((component) => component.name)
        .join(" ")}`.toLowerCase();

      return queryWords.every((word) => haystack.includes(word));
    });
  }, [favorites, favoritesSearchQuery]);

  const isSearching = favoritesSearchQuery.trim().length > 0;
  const hasFavorites = favorites.length > 0;

  const emptyStateTitle = isSearching && hasFavorites
    ? t("favorites.emptyState.noMatchesTitle")
    : t("favorites.emptyState.noFavoritesTitle");
  const emptyStateSubtitle = isSearching && hasFavorites
    ? t("favorites.emptyState.noMatchesSubtitle")
    : t("favorites.emptyState.noFavoritesSubtitle");

  const handleLogAgain = useMemo(
    () => createLogAgainHandler(addFoodLog, selectedDate),
    [addFoodLog, selectedDate]
  );

  const handleRemoveFromFavorites = useMemo(
    () => createRemoveFromFavoritesHandler(deleteFavorite, favorites, t),
    [deleteFavorite, favorites, t]
  );

  const handleDelete = useMemo(
    () => createDeleteHandler(deleteFavorite),
    [deleteFavorite]
  );

  const handleEdit = useCallback(
    (favorite: Favorite) => {
      safeNavigate(`/(tabs)/favorites/edit/${favorite.id}`);
    },
    [safeNavigate]
  );

  const renderItem = useCallback(
    ({ item }: { item: Favorite }) => (
      <FavoriteItem
        item={item}
        onEdit={handleEdit}
        onLogAgain={handleLogAgain}
        onRemoveFromFavorites={handleRemoveFromFavorites}
        onDelete={handleDelete}
      />
    ),
    [handleEdit, handleLogAgain, handleRemoveFromFavorites, handleDelete]
  );

  const keyExtractor = useCallback((item: Favorite) => item.id, []);

  return (
    <FlatList
      data={filteredFavorites}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={[
        styles.listContent,
        filteredFavorites.length === 0 && styles.emptyContent,
        { paddingBottom: dynamicBottomPadding },
      ]}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <AppText role="Body" style={styles.emptyTitle}>
            {emptyStateTitle}
          </AppText>
          <AppText role="Caption" style={styles.emptySubtitle}>
            {emptyStateSubtitle}
          </AppText>
        </View>
      )}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingTop: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    emptyContent: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
    },
    emptyState: {
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    emptyTitle: {
      color: colors.secondaryText,
    },
    emptySubtitle: {
      color: colors.secondaryText,
      textAlign: "center",
    },
  });
