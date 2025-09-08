import { AppText, Button } from "@/components/index";
import { MediaLibraryPreview } from "@/components/camera/MediaLibraryPreview";
import { RoundButton } from "@/components/shared/RoundButton";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { CameraView } from "expo-camera";
import { CameraIcon, X } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

export default function Camera() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const cameraRef = useRef<CameraView>(null);
  const [localImageURI, setLocalImageURI] = useState<string | undefined>(
    undefined
  );
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { safeDismissTo } = useNavigationGuard();

  const takePicture = async () => {
    if (!isCameraReady) return;
    const image = await cameraRef.current?.takePictureAsync();
    setLocalImageURI(image?.uri);
  };

  return (
    <View style={styles.container}>
      {localImageURI ? (
        <View style={{ flex: 1 }}>
          <Image src={localImageURI} style={styles.image} />
        </View>
      ) : (
        <>
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
          <MediaLibraryPreview onImageSelected={setLocalImageURI} />
        </>
      )}
      <RoundButton
        Icon={X}
        style={styles.closeButton}
        onPress={() => safeDismissTo("/")}
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
    image: {
      height: "100%",
      width: "100%",
    },
    contentContainer: {
      position: "absolute",
      bottom: theme.spacing.sm,
      alignSelf: "center",
      padding: theme.spacing.lg,
    },
  });
