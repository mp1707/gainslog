import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import { CameraIcon } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { RoundButton } from "@/components/shared/RoundButton";
import { MediaLibraryPreview } from "@/components/camera/MediaLibraryPreview";
import { createStyles } from "./CameraModeView.styles";

interface CameraModeViewProps {
  onImageSelected: (uri: string) => void;
}

export const CameraModeView = ({ onImageSelected }: CameraModeViewProps) => {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const cameraRef = useRef<CameraView>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Request camera permissions on mount if not granted
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePicture = useCallback(async () => {
    if (!isCameraReady || !cameraRef.current) return;
    const image = await cameraRef.current.takePictureAsync();
    if (image?.uri) {
      onImageSelected(image.uri);
    }
  }, [isCameraReady, onImageSelected]);

  return (
    <Animated.View
      entering={FadeIn.springify().damping(30).stiffness(400)}
      exiting={FadeOut.springify().damping(30).stiffness(400)}
      style={styles.container}
    >
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
          variant="primary"
          iconSize={40}
          style={styles.cameraButton}
        />
      </View>

      <MediaLibraryPreview
        onImageSelected={onImageSelected}
        style={styles.libraryPreview}
      />
    </Animated.View>
  );
};
