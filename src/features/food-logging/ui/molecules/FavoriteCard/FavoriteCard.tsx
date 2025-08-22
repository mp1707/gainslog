import React from "react";
import { TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { StarIcon } from "phosphor-react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { FoodLogCardView } from "../../FoodLogCardView";
import { createStyles } from "../../components/FoodLogCard/FoodLogCard.styles";
import { FavoriteEntry, LegacyFoodLog } from "@/types/indexLegacy";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

interface FavoriteCardProps {
  entry: FavoriteEntry;
}

export const FavoriteCard: React.FC<FavoriteCardProps> = ({ entry }) => {
  const { removeMatchingLog } = useFavoritesStore();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleRemoveFavorite = async () => {
    await Haptics.selectionAsync();
    const today = new Date();
    const logLike: LegacyFoodLog = {
      id: `fav-${today.getTime()}`,
      userTitle: entry.title,
      userDescription: entry.description,
      generatedTitle: entry.title,
      estimationConfidence: 100,
      calories: entry.calories,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
      createdAt: today.toISOString(),
      date: today.toISOString().split("T")[0],
      needsAiEstimation: false,
    };
    await removeMatchingLog(logLike);
  };

  return (
    <FoodLogCardView
      title={entry.title}
      description={entry.description}
      calories={entry.calories}
      protein={entry.protein}
      carbs={entry.carbs}
      fat={entry.fat}
      showConfidence={false}
      accessoryRight={
        <TouchableOpacity
          onPress={handleRemoveFavorite}
          style={styles.favoriteButton}
          accessibilityRole="button"
          accessibilityLabel="Remove favorite"
          accessibilityHint="Removes this entry from your favorites"
        >
          <StarIcon size={20} color="#FDB813" weight="fill" />
        </TouchableOpacity>
      }
    />
  );
};
