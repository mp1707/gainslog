import React, { useCallback, useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Stack } from "expo-router";
import {
  X,
  ArrowsClockwiseIcon,
  StarIcon,
  CameraIcon,
} from "phosphor-react-native";
import * as Haptics from "expo-haptics";
import {
  estimateNutritionImageBased,
  estimateNutritionTextBased,
} from "@/lib/supabase";
import { useTheme, useThemedStyles } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { FoodLog } from "@/types/models";
import { MetadataSection } from "@/components/detail-page/MetadataSection";
import { NutritionViewCard } from "@/components/detail-page/NutritionViewCard";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { Toast } from "toastify-react-native";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useImageSelection } from "@/hooks/useImageSelection";

export default function FoodLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { safeNavigate } = useNavigationGuard();

  const {
    foodLogs,
    favorites,
    updateFoodLog,
    deleteFoodLog,
    addFavorite,
    deleteFavorite,
  } = useAppStore();

  // Find the food log by ID
  const originalLog = foodLogs.find((log) => log.id === id);

  // Re-estimation state
  const [isReEstimating, setIsReEstimating] = React.useState(false);


  // Navigation header setup
  useLayoutEffect(() => {
    const logTitle = originalLog?.title || "Food Log";

    navigation.setOptions({
      title: logTitle,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => safeNavigate("/")}
          style={{ marginLeft: 10 }}
          accessibilityLabel="Go back"
          accessibilityHint="Returns to previous screen"
        >
          <X size={24} color={colors.primaryText} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleEdit}
          accessibilityLabel="Edit food log"
          accessibilityHint="Navigate to edit mode for this log entry"
        >
          <Text style={[styles.navButtonText, { color: colors.accent }]}>
            Edit
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, originalLog, colors, safeNavigate]);

  // If log not found, show error
  if (!originalLog) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Food log not found
        </Text>
      </View>
    );
  }

  const handleEdit = () => {
    safeNavigate(`/food-log-edit/${id}`);
  };

  const toggleFavorite = (foodLog: FoodLog) => {
    const isFavorite = favorites.some((favorite) => favorite.id === foodLog.id);
    if (isFavorite) {
      deleteFavorite(foodLog.id);
      Toast.error("Favorite removed");
    } else {
      addFavorite({
        id: foodLog.id,
        title: foodLog.title,
        description: foodLog.description,
        imageUrl: foodLog.imageUrl,
        calories: foodLog.calories,
        protein: foodLog.protein,
        carbs: foodLog.carbs,
        fat: foodLog.fat,
      });
      Toast.success("Favorite added");
    }
  };

  const handleDelete = () => {
    if (!originalLog) return;
    Alert.alert(
      "Delete Log",
      "Are you sure you want to permanently delete this log?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteFoodLog(originalLog.id);
            safeNavigate("/");
          },
        },
      ]
    );
  };

  const handleReEstimate = async () => {
    if (!originalLog || isReEstimating) return;

    const hasTitle = originalLog.title;
    const hasImage = originalLog.imageUrl;

    if (!hasTitle && !hasImage) {
      Alert.alert(
        "Nothing to Estimate",
        "Please add a title or image to enable nutrition estimation."
      );
      return;
    }

    setIsReEstimating(true);

    try {
      const title = originalLog.title || "";
      const description = originalLog.description || undefined;

      const response = hasImage
        ? await estimateNutritionImageBased({
            imageUrl: originalLog.imageUrl as string,
            title: title || undefined,
            description,
          })
        : await estimateNutritionTextBased({
            title: title || undefined,
            description,
          });

      if (response.generatedTitle === "Invalid Image") {
        Alert.alert(
          "Invalid Image",
          "The selected image could not be processed. Please try a different image."
        );
        return;
      }

      const updates: Partial<FoodLog> = {
        title: response.generatedTitle,
        calories: response.calories,
        protein: response.protein,
        carbs: response.carbs,
        fat: response.fat,
        estimationConfidence: response.estimationConfidence,
      };

      await updateFoodLog(originalLog.id, updates);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Error re-estimating nutrition:", error);
      Alert.alert(
        "Estimation Failed",
        "Unable to re-estimate nutrition. Please try again."
      );
    } finally {
      setIsReEstimating(false);
    }
  };

  const isFavorite = (foodLog: FoodLog) => {
    return favorites.some((favorite) => favorite.id === foodLog.id);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.primaryBackground }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primaryBackground },
          headerTitleStyle: {
            fontSize: 17,
            fontWeight: "600",
            fontFamily: "Nunito-SemiBold",
            color: colors.primaryText,
          },
        }}
      />

      {/* Image Section */}
      <ImageDisplay
        imageUrl={originalLog?.imageUrl}
        isUploading={false}
      />

      {/* Title and Description */}
      <View style={styles.generalSection}>
        <Text style={[styles.title, { color: colors.primaryText }]}>
          {originalLog?.title}
        </Text>
        {originalLog?.description && (
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            {originalLog.description}
          </Text>
        )}
      </View>

      {/* Nutrition Section */}
      <View style={styles.nutritionSection}>
        <View style={styles.nutritionHeader}>
          
          <TouchableOpacity
            onPress={() => originalLog && toggleFavorite(originalLog)}
            style={styles.favoriteButton}
            accessibilityLabel={
              originalLog && isFavorite(originalLog)
                ? "Remove from favorites"
                : "Add to favorites"
            }
            accessibilityHint={
              originalLog && isFavorite(originalLog)
                ? "Removes this log from your favorites"
                : "Adds this log to your favorites"
            }
          >
            <StarIcon
              size={20}
              color={colors.accent}
              weight={
                originalLog && isFavorite(originalLog) ? "fill" : "regular"
              }
            />
            <Text style={[styles.favoriteButtonText, { color: colors.accent }]}>
              {originalLog && isFavorite(originalLog)
                ? "Favorited"
                : "Add to Favorites"}
            </Text>
          </TouchableOpacity>
        </View>
        {originalLog && <NutritionViewCard log={originalLog} />}
      </View>

      {/* Re-estimation Button */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[
            styles.reEstimateButton,
            {
              backgroundColor: "transparent",
              borderColor: colors.accent,
              opacity: isReEstimating ? 0.6 : 1,
            },
          ]}
          onPress={handleReEstimate}
          disabled={isReEstimating}
          accessibilityLabel="Re-estimate nutrition with AI"
          accessibilityHint="Uses AI to generate new nutrition estimates based on the current title and image"
          accessibilityState={{ busy: isReEstimating }}
        >
          {isReEstimating ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <ArrowsClockwiseIcon size={16} color={colors.accent} />
          )}
          <Text style={[styles.reEstimateButtonText, { color: colors.accent }]}>
            {isReEstimating ? "Estimating..." : "Re-estimate with AI"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Metadata Section */}
      {originalLog && <MetadataSection log={originalLog} />}

      {/* Delete Button */}
      <View style={styles.deleteSection}>
        <TouchableOpacity
          onPress={handleDelete}
          accessibilityLabel="Delete food log"
          accessibilityHint="Permanently deletes this log entry. This action cannot be undone."
          accessibilityRole="button"
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>
            Delete Log
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: any, theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingBottom: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingVertical: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      ...theme.typography.Body,
    },
    navButtonText: {
      ...theme.typography.Body,
      fontSize: 17,
    },
    generalSection: {
     
    },
    title: {
      ...theme.typography.Title1,
      marginBottom: theme.spacing.sm,
    },
    description: {
      ...theme.typography.Body,
      lineHeight: 22,
    },
    nutritionSection: {
    },
    nutritionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: theme.spacing.md,
    },
    favoriteButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    favoriteButtonText: {
      ...theme.typography.Body,
      fontSize: 15,
      fontWeight: "500",
    },
    actionsSection: {
      alignItems: "center",
      marginVertical: theme.spacing.lg,
    },
    reEstimateButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderWidth: 1.5,
      borderRadius: theme.components.buttons.cornerRadius,
      gap: theme.spacing.xs,
      minWidth: 160,
    },
    reEstimateButtonText: {
      ...theme.typography.Body,
      fontWeight: "500",
    },
    deleteSection: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingVertical: theme.spacing.xl,
      alignItems: "center",
    },
    deleteButtonText: {
      ...theme.typography.Body,
      fontWeight: "600",
    },
  });
