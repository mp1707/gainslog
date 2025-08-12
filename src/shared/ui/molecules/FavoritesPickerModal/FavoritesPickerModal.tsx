import React, { useEffect, useMemo, useState } from "react";
import { Modal, View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/providers/ThemeProvider";
import { useFavoritesStore } from "@/stores/useFavoritesStore";
import { FavoriteEntry } from "@/types";
import { createStyles } from "./FavoritesPickerModal.styles";
import { AppText } from "@/components";
import { SearchBar } from "@/shared/ui/components";
import { FavoriteCard } from "@/features/food-logging/ui/FavoriteCard";
import { PageHeader } from "../PageHeader";

interface FavoritesPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFavorite: (fav: FavoriteEntry) => void;
}

export const FavoritesPickerModal: React.FC<FavoritesPickerModalProps> = ({
  visible,
  onClose,
  onSelectFavorite,
}) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const { favorites, isLoading, loadFavorites, filter } = useFavoritesStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (visible) {
      loadFavorites();
      setQuery("");
    }
  }, [visible]);

  const filtered = filter(query);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <AppText role="Headline">Favorites</AppText>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
          >
            <AppText role="Button" style={styles.closeText}>
              Close
            </AppText>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBarContainer}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search favorites"
          />
        </View>
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
              No favorites
            </AppText>
          ) : (
            filtered.map((fav, idx) => (
              <TouchableOpacity
                key={`${fav.title}-${idx}`}
                onPress={() => onSelectFavorite(fav)}
                accessibilityRole="button"
                accessibilityLabel={`Use favorite ${fav.title}`}
                activeOpacity={0.8}
              >
                <FavoriteCard entry={fav} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
