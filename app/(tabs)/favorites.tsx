import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView, Alert } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { useAppStore } from "@/store";
import { LogCard } from "@/components/daily-food-logs/LogCard";
import { AppText } from "@/components/shared/AppText";
import { PageHeader } from "@/components/shared/PageHeader";
import { FoodLog } from "@/types";
import { SearchBar } from "@/components/shared/SearchBar/SearchBar";

export default function FavoritesTab() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // Get favorites from store
  const favorites = useAppStore((state) => state.favorites);
  const toggleFavoriteForLog = useAppStore(
    (state) => state.toggleFavoriteForLog
  );

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

  // Convert FavoriteEntry to FoodLog format for LogCard display
  const convertFavoriteToFoodLog = useCallback((favorite: any): FoodLog => {
    return {
      id: favorite.id,
      createdAt: favorite.createdAt,
      date: favorite.date,
      userTitle: favorite.title,
      userDescription: favorite.description,
      userCalories: favorite.calories,
      userProtein: favorite.protein,
      userCarbs: favorite.carbs,
      userFat: favorite.fat,
      estimationConfidence: favorite.estimationConfidence,
    };
  }, []);

  // Handle favorite removal with confirmation popup
  const handleCardPress = useCallback(
    (favorite: any) => {
      const favoriteTitle = favorite.title || "this item";
      
      Alert.alert(
        "Remove Favorite",
        `Remove "${favoriteTitle}" from favorites?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => {
              const foodLog = convertFavoriteToFoodLog(favorite);
              toggleFavoriteForLog(foodLog);
            },
          },
        ]
      );
    },
    [convertFavoriteToFoodLog, toggleFavoriteForLog]
  );


  return (
    <SafeAreaView
      style={[
        {
          flex: 1,
          backgroundColor: colors.primaryBackground,
        },
      ]}
      edges={["top"]}
    >
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        {/* Search Bar */}
        <View style={{ marginBottom: theme.spacing.lg }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search favorites..."
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filteredFavorites.length === 0 ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: theme.spacing.xl * 2,
              }}
            >
              <AppText
                role="Title2"
                color="secondary"
                style={{ textAlign: "center", marginBottom: theme.spacing.md }}
              >
                {searchQuery.trim() ? "No favorites found" : "No favorites yet"}
              </AppText>
              <AppText
                role="Body"
                color="secondary"
                style={{ textAlign: "center", lineHeight: 22 }}
              >
                {searchQuery.trim()
                  ? "Try adjusting your search terms"
                  : "Favorite food logs to see them here"}
              </AppText>
            </View>
          ) : (
            <View style={{ gap: theme.spacing.md }}>
              {filteredFavorites.map((favorite, index) => {
                const foodLog = convertFavoriteToFoodLog(favorite);
                return (
                  <LogCard
                    key={favorite.id}
                    foodLog={foodLog}
                    onPress={() => handleCardPress(favorite)}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
