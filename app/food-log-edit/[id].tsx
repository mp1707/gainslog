import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Stack } from "expo-router";
import { CameraIcon, X } from "phosphor-react-native";
import { Colors, Theme, useTheme, useThemedStyles } from "@/theme";
import { useAppStore } from "@/store/useAppStore";
import { NutritionEditCard } from "@/components/detail-page/NutritionEditCard";
import { ImageDisplay } from "@/components/shared/ImageDisplay";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useImageSelection } from "@/hooks/useImageSelection";

export default function FoodLogEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { safeNavigate } = useNavigationGuard();

  const { foodLogs, updateFoodLog } = useAppStore();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Find the food log by ID
  const originalLog = foodLogs.find((log) => log.id === id);

  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      originalLog && updateFoodLog(originalLog.id, { imageUrl });
      setIsUploadingImage(false);
    },
    onUploadStart: () => {
      setIsUploadingImage(true);
    },
    onUploadError: () => {
      setIsUploadingImage(false);
    },
  });

  // Set up navigation header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: "Edit Log",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => safeNavigate("/food-log-detail/" + id)}
          style={{ marginLeft: 10 }}
          accessibilityLabel="Cancel editing"
          accessibilityHint="Discards changes and returns to detail view"
        >
          <Text style={[styles.navButtonText, { color: colors.accent }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          accessibilityLabel="Save changes"
          accessibilityHint="Saves edits and returns to detail view"
        >
          <Text
            style={[
              styles.navButtonText,
              styles.navButtonDone,
              { color: colors.accent },
            ]}
          >
            Done
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, id, safeNavigate]);

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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Save functionality to be implemented");
    safeNavigate("/food-log-detail/" + id);
  };

  const handleFieldUpdate = (field: string, value: any) => {
    // TODO: Implement field update functionality
    console.log("Field update functionality to be implemented", field, value);
  };

  const handleImageInput = useCallback(() => {
    showImagePickerAlert();
  }, [showImagePickerAlert]);

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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

      <ScrollView
        style={[
          styles.container,
          { backgroundColor: colors.primaryBackground },
        ]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Image Section */}
        <View>
          <ImageDisplay
            imageUrl={originalLog?.imageUrl}
            isUploading={isUploadingImage}
          />
          <TouchableOpacity
            onPress={handleImageInput}
            style={styles.button}
            accessibilityLabel={
              originalLog.imageUrl !== "" ? "Change image" : "Add image"
            }
            accessibilityHint={
              originalLog.imageUrl !== ""
                ? "Changes the image for this log"
                : "Adds an image to this log"
            }
          >
            <CameraIcon
              size={20}
              color={colors.primaryText}
              weight={originalLog.imageUrl !== "" ? "fill" : "regular"}
            />
            <Text style={styles.buttonText}>
              {originalLog.imageUrl !== "" ? "Change image" : "Add image"}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Title and Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Title
          </Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                color: colors.primaryText,
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.border,
              },
            ]}
            value={originalLog?.title || ""}
            onChangeText={(text) => handleFieldUpdate("title", text)}
            placeholder="Food title"
            placeholderTextColor={colors.secondaryText}
            accessibilityLabel="Food title"
            accessibilityHint="Enter or edit the name of the food item"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                color: colors.primaryText,
                backgroundColor: colors.secondaryBackground,
                borderColor: colors.border,
              },
            ]}
            value={originalLog?.description || ""}
            onChangeText={(text) => handleFieldUpdate("description", text)}
            placeholder="Add a description..."
            placeholderTextColor={colors.secondaryText}
            multiline
            numberOfLines={3}
            accessibilityLabel="Food description"
            accessibilityHint="Enter additional details about the food item"
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            Nutrition
          </Text>
          <NutritionEditCard
            log={originalLog}
            onUpdateNutrition={handleFieldUpdate}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: Colors, theme: Theme) => {
  const { spacing, typography, components } = theme;
  return StyleSheet.create({
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
    navButtonDone: {
      ...theme.typography.Headline,
      fontWeight: "600",
    },
    section: {
      gap: theme.spacing.md,
    },
    titleInput: {
      ...theme.typography.Body,
      borderWidth: 1,
      borderRadius: theme.components.buttons.cornerRadius,
      padding: theme.spacing.md,
      minHeight: 50,
      textAlignVertical: "top",
    },
    descriptionInput: {
      ...theme.typography.Body,
      borderWidth: 1,
      borderRadius: theme.components.buttons.cornerRadius,
      padding: theme.spacing.md,
      minHeight: 80,
      textAlignVertical: "top",
    },
    nutritionSection: {
      gap: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.Headline,
    },
    button: {
      position: "absolute",
      bottom: 10,
      right: 10,
      borderRadius: components.buttons.cornerRadius,
      // paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 40,
      gap: theme.spacing.sm,
      backgroundColor: colors.secondaryBackground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    buttonText: {
      fontSize: typography.Button.fontSize,
      fontFamily: typography.Button.fontFamily,
      color: colors.primaryText,
      fontWeight: "600",
      marginRight: spacing.sm,
    },
  });
};
