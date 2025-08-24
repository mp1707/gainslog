import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Modal, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { X } from "phosphor-react-native";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { SearchBar } from "@/components/shared/SearchBar/SearchBar";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { AppText } from "@/components/shared/AppText";
import { FoodLog, FavoriteEntry } from "@/types";
import { generateFoodLogId } from "@/utils/idGenerator";
import { createStyles } from "./FavoritesSelectionModal.styles";

interface FavoritesSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFavorite: (foodLog: FoodLog) => void;
}

export const FavoritesSelectionModal: React.FC<FavoritesSelectionModalProps> = ({
  visible,
  onClose,
  onSelectFavorite,
}) => {
  const { colors, theme } = useTheme();
  const styles = createStyles(colors, theme);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // Get favorites from store and selected date
  const favorites = useAppStore((state) => state.favorites);
  const selectedDate = useAppStore((state) => state.selectedDate);

  // Filter favorites based on search query
  const filteredFavorites = useMemo(() => {
    if (!searchQuery.trim()) return favorites;

    const query = searchQuery.toLowerCase().trim();
    return favorites.filter(
      (favorite) =>
        favorite.title?.toLowerCase().includes(query) ||
        favorite.description?.toLowerCase().includes(query)
    );
  }, [favorites, searchQuery]);

  // Convert FavoriteEntry to FoodLog format
  const convertFavoriteToFoodLog = useCallback(
    (favorite: FavoriteEntry): FoodLog => {
      const now = new Date();
      const id = generateFoodLogId();

      return {
        id,
        userTitle: favorite.title,
        userDescription: favorite.description,
        generatedTitle: favorite.title,
        estimationConfidence: 100, // Favorites are considered fully confident
        userCalories: favorite.calories,
        userProtein: favorite.protein,
        userCarbs: favorite.carbs,
        userFat: favorite.fat,
        createdAt: now.toISOString(),
        date: selectedDate,
      };
    },
    [selectedDate]
  );

  // Handle favorite selection
  const handleSelectFavorite = useCallback(
    (favorite: FavoriteEntry) => {
      console.log("🌟 FavoritesModal selecting favorite:", favorite.title);
      const foodLog = convertFavoriteToFoodLog(favorite);
      onSelectFavorite(foodLog);
      onClose();
    },
    [convertFavoriteToFoodLog, onSelectFavorite, onClose]
  );

  // Reset search when modal closes
  const handleClose = useCallback(() => {
    console.log("🌟 FavoritesModal handleClose called");
    setSearchQuery("");
    onClose();
  }, [onClose]);

  // Debug log for modal visibility
  console.log("🌟 FavoritesModal render - visible:", visible, "favorites count:", favorites.length);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="dark" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              accessibilityLabel="Close favorites"
              accessibilityHint="Closes the favorites selection modal"
            >
              <X size={24} color={colors.primaryText} />
            </TouchableOpacity>
            
            <AppText role="Title2" style={styles.title}>
              Select Favorite
            </AppText>
            
            {/* Spacer for balance */}
            <View style={styles.headerSpacer} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search favorites..."
            />
          </View>

          {/* Favorites List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredFavorites.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AppText
                  role="Title2"
                  color="secondary"
                  style={styles.emptyTitle}
                >
                  {searchQuery.trim() ? "No favorites found" : "No favorites yet"}
                </AppText>
                <AppText
                  role="Body"
                  color="secondary"
                  style={styles.emptyMessage}
                >
                  {searchQuery.trim()
                    ? "Try adjusting your search terms"
                    : "Favorite food logs to see them here"}
                </AppText>
              </View>
            ) : (
              <View style={styles.listContainer}>
                {filteredFavorites.map((favorite) => {
                  const foodLog = convertFavoriteToFoodLog(favorite);
                  return (
                    <LogCard
                      key={favorite.id}
                      foodLog={foodLog}
                      onPress={() => handleSelectFavorite(favorite)}
                    />
                  );
                })}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};