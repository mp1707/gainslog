// import React, { useCallback, useMemo } from "react";
// import { ScrollView, StyleSheet, View } from "react-native";
// import { useLocalSearchParams } from "expo-router";

// import { LogCard } from "@/components/daily-food-logs";
// import { SwipeToFunctions } from "@/components/shared/SwipeToFunctions";
// import { useTabBarSpacing } from "@/hooks/useTabBarSpacing";
// import { useAppStore } from "@/store/useAppStore";
// import { Colors, Theme, useTheme } from "@/theme";
// import { Favorite } from "@/types/models";
// import { generateFoodLogId } from "@/utils/idGenerator";
// import { lockNav } from "@/utils/navigationLock";

// const FavoritesTabScreen = () => {
//   const { colors, theme } = useTheme();
//   const { dynamicBottomPadding } = useTabBarSpacing();
//   const { search } = useLocalSearchParams<{ search?: string }>();

//   const favorites = useAppStore((state) => state.favorites);
//   const deleteFavorite = useAppStore((state) => state.deleteFavorite);
//   const addFoodLog = useAppStore((state) => state.addFoodLog);
//   const selectedDate = useAppStore((state) => state.selectedDate);

//   const searchQuery = search || "";

//   const styles = useMemo(
//     () => createStyles(colors, theme, dynamicBottomPadding),
//     [colors, theme, dynamicBottomPadding]
//   );

//   const filteredFavorites = useMemo(() => {
//     if (!searchQuery.trim()) return favorites;

//     const normalizedQuery = searchQuery.toLowerCase();

//     return favorites.filter(
//       (favorite) =>
//         favorite.title.toLowerCase().includes(normalizedQuery) ||
//         favorite.description?.toLowerCase().includes(normalizedQuery)
//     );
//   }, [favorites, searchQuery]);

//   const handleLogFavorite = useCallback(
//     (favorite: Favorite) => {
//       lockNav(400);
//       addFoodLog({
//         ...favorite,
//         logDate: selectedDate,
//         createdAt: new Date().toISOString(),
//         isEstimating: false,
//         needsUserReview: false,
//         id: generateFoodLogId(),
//       });
//     },
//     [addFoodLog, selectedDate]
//   );

//   return (
//     <>
//       <ScrollView
//         style={styles.container}
//         contentContainerStyle={styles.contentContainer}
//         contentInsetAdjustmentBehavior="automatic"
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.listContainer}>
//           {filteredFavorites.map((favorite) => (
//             <SwipeToFunctions
//               key={favorite.id}
//               onDelete={() => deleteFavorite(favorite.id)}
//               onTap={() => handleLogFavorite(favorite)}
//             >
//               <LogCard
//                 foodLog={favorite}
//                 contextMenuPreset="favorites"
//                 onRemoveFromFavorites={() => deleteFavorite(favorite.id)}
//                 onDelete={() => deleteFavorite(favorite.id)}
//               />
//             </SwipeToFunctions>
//           ))}
//         </View>
//       </ScrollView>
//     </>
//   );
// };

// const createStyles = (
//   colors: Colors,
//   theme: Theme,
//   bottomPadding: number
// ) =>
//   StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: colors.primaryBackground,
//     },
//     contentContainer: {
//       flexGrow: 1,
//       paddingHorizontal: theme.spacing.md,
//       paddingBottom: bottomPadding,
//       paddingTop: theme.spacing.md,
//     },
//     listContainer: {
//       gap: theme.spacing.md,
//     },
//   });

// export default FavoritesTabScreen;
