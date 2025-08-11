import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/shared/ui/molecules/PageHeader";
import { useTheme } from "@/providers/ThemeProvider";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { SearchBar } from "@/shared/ui/components/SearchBar/SearchBar";
import { FavoriteEntry } from "@/types";
import { AppText } from "src/components";
import { FavoriteCard } from "@/features/food-logging/ui/FavoriteCard";

export default function FavoritesTab() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { isLoading, loadFavorites, filter } = useFavoritesStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  const filtered = filter(query);

  const renderItem = (fav: FavoriteEntry, idx: number) => (
    <View key={`${fav.title}-${idx}`} style={styles.cardContainer}>
      <FavoriteCard entry={fav} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <PageHeader>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search favorites"
        />
      </PageHeader>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoading ? (
          <AppText role="Body" color="secondary">
            Loading…
          </AppText>
        ) : filtered.length === 0 ? (
          <AppText role="Body" color="secondary">
            No favorites saved yet.
          </AppText>
        ) : (
          filtered.map(renderItem)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: any, theme: any) {
  return {
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.xl,
      gap: theme.spacing.md,
    },
    cardContainer: {},
  } as const;
}
