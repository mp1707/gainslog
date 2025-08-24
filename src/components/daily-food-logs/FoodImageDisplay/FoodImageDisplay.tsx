import React from "react";
import { View, Image } from "react-native";
import { FoodLog } from "@/types";
import { useStyles } from "./FoodImageDisplay.styles";
import { ImageSkeleton } from "../LogModal/ImageSkeleton";

interface FoodImageDisplayProps {
  log: FoodLog;
}

export const FoodImageDisplay: React.FC<FoodImageDisplayProps> = ({ log }) => {
  const styles = useStyles();

  // Don't render anything if there's no image
  if (!log.imageUrl && !log.localImageUri) {
    return null;
  }

  return (
    <View style={styles.imageContainer}>
      {log.isUploading ? (
        <ImageSkeleton width="100%" height={200} style={styles.foodImage} />
      ) : (
        <Image
          source={{ uri: log.imageUrl || log.localImageUri }}
          style={styles.foodImage}
          resizeMode="cover"
        />
      )}
    </View>
  );
};
