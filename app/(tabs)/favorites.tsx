import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PageHeader } from "@/shared/ui/molecules/PageHeader";
import { useTheme } from "@/providers/ThemeProvider";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { SearchBar } from "@/shared/ui/components/SearchBar/SearchBar";
import { FavoriteEntry } from "@/types";
import { AppText, Card } from "src/components";
import { FoodLogCard } from "@/features/food-logging";

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
    <Card key={`${fav.title}-${idx}`} style={styles.card}>
      <View style={styles.itemTop}>
        <AppText role="Headline" style={styles.title}>
          {fav.title}
        </AppText>
        {fav.description ? (
          <AppText role="Caption" color="secondary">
            {fav.description}
          </AppText>
        ) : null}
      </View>
      <View style={styles.itemBottom}>
        <AppText role="Caption">{fav.calories} kcal</AppText>
        <AppText role="Caption">{fav.protein}g P</AppText>
        <AppText role="Caption">{fav.carbs}g C</AppText>
        <AppText role="Caption">{fav.fat}g F</AppText>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <PageHeader>
        <AppText role="Title2">Favorites</AppText>
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
      gap: theme.spacing.sm,
    },
    card: {
      borderRadius: theme.components.cards.cornerRadius,
    },
    itemTop: { gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
    title: { color: colors.primaryText },
    itemBottom: {
      flexDirection: "row",
      gap: theme.spacing.sm,
      justifyContent: "flex-end",
    },
  } as const;
}
