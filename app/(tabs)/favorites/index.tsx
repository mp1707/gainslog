import React, { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { Favorite } from "@/types/models";
import { useAppStore } from "@/store/useAppStore";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
import {
  createLogAgainHandler,
  createRemoveFromFavoritesHandler,
} from "@/utils/foodLogHandlers";
import { FavoriteItem } from "@/components/favorites/FavoriteItem";
import { AppText } from "@/components/index";
import { Colors, Theme, useTheme } from "@/theme";

export default function FavoritesScreen() {
  const favorites = useAppStore((state) => state.favorites);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const addFoodLog = useAppStore((state) => state.addFoodLog);
  const deleteFavorite = useAppStore((state) => state.deleteFavorite);

  const { safeNavigate } = useNavigationGuard();
  const { dynamicBottomPadding } = useTabBarSpacing();
  const { colors, theme } = useTheme();

  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const handleLogAgain = useMemo(
    () => createLogAgainHandler(addFoodLog, selectedDate),
    [addFoodLog, selectedDate]
  );

  const handleRemoveFromFavorites = useMemo(
    () => createRemoveFromFavoritesHandler(deleteFavorite, favorites),
    [deleteFavorite, favorites]
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
      />
    ),
    [handleEdit, handleLogAgain, handleRemoveFromFavorites]
  );

  const keyExtractor = useCallback((item: Favorite) => item.id, []);

  return (
    <FlatList
      data={favorites}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      style={styles.list}
      contentContainerStyle={[
        styles.listContent,
        favorites.length === 0 && styles.emptyContent,
        { paddingBottom: dynamicBottomPadding },
      ]}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <AppText role="Body" style={styles.emptyTitle}>
            No favorites yet
          </AppText>
          <AppText role="Caption" style={styles.emptySubtitle}>
            Save meals while logging to keep them handy here.
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
