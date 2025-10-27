import { MediaLibraryPreview } from "@/components/camera/MediaLibraryPreview";
import { RoundButton } from "@/components/shared/RoundButton";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CameraIcon, X } from "lucide-react-native";
import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import { useSafeRouter } from "@/hooks/useSafeRouter";
import { useCreationStore } from "@/store/useCreationStore";

export default function Camera() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const router = useSafeRouter();

  const updateDraft = useCreationStore((state) => state.updateDraft);
  const { logId } = useLocalSearchParams<{ logId?: string }>();

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Request camera permissions on mount if not granted
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Handler for image URI - immediately closes camera and returns to create screen
  // Image processing will happen on the create screen to show loading skeleton
  const handleImageUri = useCallback(
    (uri: string) => {
      if (typeof logId !== "string" || !logId) {
        // If camera isn't given a draft to update, just dismiss
        if (router.canGoBack()) router.back();
        return;
      }

      // Immediately update draft with temporary flag to trigger processing
      updateDraft(logId, {
        pendingImageUri: uri,
      });

      // Close camera immediately - create screen will handle processing
      if (router.canGoBack()) router.back();
    },
    [router, updateDraft, logId]
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
    if (router.canGoBack()) router.back();
  }, [router]);

  return (
    <View style={styles.container}>
      <CameraView
        key={permission?.granted ? "camera-granted" : "camera-waiting"}
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
        onImageSelected={handleImageUri}
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
