import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Camera, PencilSimple } from "phosphor-react-native";
import { useTheme } from "@/providers";
import { theme } from "@/theme";
import { LegacyFoodLog } from "@/types/indexLegacy";
import { useImageCapture } from "@/hooks/useImageCapture";

interface ImageSectionProps {
  log: LegacyFoodLog;
  isEditing: boolean;
  onLogUpdate: (updatedLog: LegacyFoodLog) => void;
}

export const ImageSection: React.FC<ImageSectionProps> = ({
  log,
  isEditing,
  onLogUpdate,
}) => {
  const { colors } = useTheme();
  const { launchCamera, launchImageLibrary } = useImageCapture();

  const handleImagePress = () => {
    if (!isEditing) return;

    Alert.alert("Update Photo", "Choose how you'd like to update the photo", [
      { text: "Camera", onPress: handleCameraPress },
      { text: "Photo Library", onPress: handleLibraryPress },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleCameraPress = async () => {
    const result = await launchCamera((updatedLog) => {
      onLogUpdate(updatedLog);
    });

    if (result) {
      onLogUpdate(result);
    }
  };

  const handleLibraryPress = async () => {
    const result = await launchImageLibrary((updatedLog) => {
      onLogUpdate(updatedLog);
    });

    if (result) {
      onLogUpdate(result);
    }
  };

  const imageSource = log.imageUrl || log.localImageUri;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleImagePress}
      disabled={!isEditing}
      activeOpacity={isEditing ? 0.7 : 1}
    >
      {imageSource ? (
        <>
          <Image source={{ uri: imageSource }} style={styles.image} />
          {isEditing && (
            <View style={styles.editOverlay}>
              <View
                style={[styles.editButton, { backgroundColor: colors.accent }]}
              >
                <PencilSimple size={20} color={colors.white} weight="bold" />
              </View>
            </View>
          )}
        </>
      ) : (
        <View
          style={[
            styles.placeholder,
            { backgroundColor: colors.secondaryBackground },
          ]}
        >
          <Camera size={32} color={colors.secondaryText} />
          <Text
            style={[styles.placeholderText, { color: colors.secondaryText }]}
          >
            {isEditing ? "Tap to Add Photo" : "No Photo"}
          </Text>
        </View>
      )}

      {log.isUploading && (
        <View style={styles.uploadingOverlay}>
          <Text style={[styles.uploadingText, { color: colors.white }]}>
            Uploading...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...theme.typography.Subhead,
    marginTop: theme.spacing.sm,
  },
  editOverlay: {
    position: "absolute",
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "rgba(0, 0, 0, 0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    ...theme.typography.Body,
    fontWeight: "600",
  },
});
