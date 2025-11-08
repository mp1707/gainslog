import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import type { ListRenderItem } from "react-native";
import { useTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme";
import type { Favorite } from "@/types/models";
import { AppText } from "@/components/shared/AppText";
import { FavoritePreviewCard } from "@/components/create-page/FavoritePreviewCard/FavoritePreviewCard";
import { CARD_WIDTH } from "@/constants/create";

interface FavoritesSectionProps {
  favorites: Favorite[];
  onSelectFavorite: (favorite: Favorite) => void;
  isVisible: boolean;
}

export const FavoritesSection = ({
  favorites,
  onSelectFavorite,
  isVisible,
}: FavoritesSectionProps) => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const renderFavoriteCard = useCallback<ListRenderItem<Favorite>>(
    ({ item }) => (
      <FavoritePreviewCard
        favorite={item}
        onPress={() => onSelectFavorite(item)}
        width={CARD_WIDTH}
      />
    ),
    [onSelectFavorite]
  );

  if (!isVisible) return null;

  return (
    <View style={styles.favoritesSection}>
      <AppText role="Caption" style={[styles.heading, { color: colors.secondaryText }]}>
        {favorites.length > 0 ? " Favorites" : "No favorites found"}
      </AppText>
      {favorites.length > 0 && (
        <View style={styles.favoritesListOffsetFix}>
          <FlatList
            horizontal
            data={favorites}
            renderItem={renderFavoriteCard}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => (
              <View style={styles.favoriteSeparator} />
            )}
            showsHorizontalScrollIndicator={false}
            contentInset={{ left: theme.spacing.sm }}
            contentContainerStyle={styles.favoritesListContent}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    favoritesSection: {
      gap: theme.spacing.sm,
    },
    favoritesListOffsetFix: {
      marginTop: -theme.spacing.xl,
    },
    heading: {
      textTransform: "uppercase",
      letterSpacing: 0.6,
      paddingHorizontal: theme.spacing.lg,
    },
    favoritesListContent: {
      paddingVertical: theme.spacing.xl,
      paddingRight: theme.spacing.xl,
      paddingLeft: theme.spacing.sm,
    },
    favoriteSeparator: {
      width: theme.spacing.sm,
    },
  });
