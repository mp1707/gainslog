import { MediaLibraryPreview } from "@/components/camera/MediaLibraryPreview";
import { RoundButton } from "@/components/shared/RoundButton";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { CameraView } from "expo-camera";
import { CameraIcon, X } from "lucide-react-native";
import { useMemo, useRef, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { processImage } from "@/utils/processImage"; // ++ IMPORT image processor
import { showErrorToast } from "@/lib/toast"; // ++ IMPORT toast for error handling
import { useCreationStore } from "@/store/useCreationStore";

export default function Camera() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const router = useRouter();

  // ++ GET the updater function from our new store
  const updatePendingLog = useCreationStore((state) => state.updatePendingLog);

  // -- REMOVE useLocalSearchParams for source and logId. They are no longer needed.

  // ++ CREATE a single handler for any image URI (from camera or library)
  const handleImageUri = useCallback(
    async (uri: string) => {
      try {
        const { localImagePath, supabaseImagePath } = await processImage(uri);

        // Update the central store with the new image and reset nutrition
        updatePendingLog({
          localImagePath,
          supabaseImagePath,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          estimationConfidence: 0,
        });

        // Simply go back. The previous screen will react to the state change.
        if (router.canGoBack()) {
          router.back();
        }
      } catch (error) {
        console.log("Error processing image in camera:", error);
        showErrorToast("Error processing image", "Please try again.");
      }
    },
    [router, updatePendingLog]
  );

  const takePicture = async () => {
    if (!isCameraReady || !cameraRef.current) return;
    const image = await cameraRef.current.takePictureAsync();
    if (image?.uri) {
      handleImageUri(image.uri); // ++ USE the new handler
    }
  };

  // ++ SIMPLIFY cancel to just go back
  const handleCancel = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />
      <View style={styles.contentContainer}>
        <RoundButton
          Icon={CameraIcon}
          onPress={takePicture}
          variant={"primary"}
          iconSize={40}
          style={styles.cameraButton}
        />
      </View>
      <MediaLibraryPreview
        onImageSelected={handleImageUri} // ++ USE the new handler
      />

      <RoundButton
        Icon={X}
        style={styles.closeButton}
        onPress={handleCancel}
        variant="secondary"
      />
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
    },
    camera: {
      flex: 1,
    },
    cameraButton: {},
    contentContainer: {
      position: "absolute",
      bottom: theme.spacing.sm,
      alignSelf: "center",
      padding: theme.spacing.lg,
    },
  });
