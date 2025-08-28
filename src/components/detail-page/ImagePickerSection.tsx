import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Camera } from "phosphor-react-native";
import { useTheme } from "@/theme";
import { theme } from "@/theme";
import { FoodLog } from "@/types/models";
import { useImageCapture } from "@/hooks/useImageCapture";

interface ImagePickerSectionProps {
  log: FoodLog;
  onLogUpdate: (updatedLog: FoodLog) => void;
}

export const ImagePickerSection: React.FC<ImagePickerSectionProps> = ({
  log,
  onLogUpdate,
}) => {
  const { colors } = useTheme();
  const componentStyles = theme.getComponentStyles();
  const { launchCamera, launchImageLibrary } = useImageCapture();

  const handleImagePress = () => {
    Alert.alert("Select Photo", "Choose how you'd like to add a photo", [
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
      style={[styles.container, { ...componentStyles.cards }]}
      onPress={handleImagePress}
    >
      {imageSource ? (
        <Image source={{ uri: imageSource }} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Camera size={32} color={colors.secondaryText} />
          <Text
            style={[styles.placeholderText, { color: colors.secondaryText }]}
          >
            Add Photo
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
    height: 200,
    borderRadius: theme.components.cards.cornerRadius,
    marginVertical: theme.spacing.lg,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    ...theme.typography.Subhead,
    marginTop: theme.spacing.sm,
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
