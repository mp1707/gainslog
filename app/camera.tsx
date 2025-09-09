import { AppText, Button } from "@/components/index";
import { MediaLibraryPreview } from "@/components/camera/MediaLibraryPreview";
import { RoundButton } from "@/components/shared/RoundButton";
import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { CreateHeader } from "@/components/create-page/CreateHeader/CreateHeader";
import { EstimationTab } from "@/components/create-page/EstimationTab/EstimationTab";
import { KeyboardAccessory } from "@/components/create-page/KeyboardAccessory/KeyboardAccessory";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useEstimation } from "@/hooks/useEstimation";
import { useImageSelection } from "@/hooks/useImageSelection";
import { useDelayedAutofocus } from "@/hooks/useDelayedAutofocus";
import { uploadToSupabaseStorage } from "@/utils/uploadToSupabaseStorage";
import { Colors, Theme } from "@/theme/theme";
import { useTheme } from "@/theme/ThemeProvider";
import { CameraView } from "expo-camera";
import { CameraIcon, X } from "lucide-react-native";
import { useMemo, useRef, useState, useCallback } from "react";
import { Image, StyleSheet, View, TextInput as RNTextInput } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useAppStore } from "@/store/useAppStore";

const inputAccessoryViewID = "camera-create-input-accessory";

export default function Camera() {
  const { colors, theme } = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const cameraRef = useRef<CameraView>(null);
  const textInputRef = useRef<RNTextInput>(null);
  const [localImageURI, setLocalImageURI] = useState<string | undefined>(
    undefined
  );
  const [supabaseImagePath, setSupabaseImagePath] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const { safeDismissTo } = useNavigationGuard();
  const { startEstimation } = useEstimation();
  const { selectedDate } = useAppStore();

  useDelayedAutofocus(textInputRef);

  const { showImagePickerAlert } = useImageSelection({
    onImageSelected: (imageUrl: string) => {
      setSupabaseImagePath(imageUrl);
      setIsUploadingImage(false);
    },
    onUploadStart: () => {
      setIsUploadingImage(true);
    },
    onUploadError: () => {
      setIsUploadingImage(false);
    },
  });

  const takePicture = async () => {
    if (!isCameraReady) return;
    const image = await cameraRef.current?.takePictureAsync();
    setLocalImageURI(image?.uri);
    
    // Automatically upload the image to Supabase
    if (image?.uri) {
      setIsUploadingImage(true);
      try {
        const uploadedImageUrl = await uploadToSupabaseStorage(image.uri);
        setSupabaseImagePath(uploadedImageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  const handleDescriptionChange = useCallback((text: string) => {
    setDescription(text);
  }, []);

  const handleCancel = useCallback(() => {
    safeDismissTo("/");
  }, [safeDismissTo]);

  const canContinue = description.trim() !== "" || supabaseImagePath !== "";

  const estimateLabel = useMemo(() => {
    return "Estimate";
  }, []);

  const handleEstimation = useCallback(() => {
    if (!localImageURI) return;

    startEstimation({
      logDate: selectedDate,
      createdAt: new Date().toISOString(),
      title: "",
      description: description,
      supabaseImagePath: supabaseImagePath,
    });
    
    safeDismissTo("/");
  }, [description, supabaseImagePath, localImageURI, selectedDate, startEstimation, safeDismissTo]);

  return (
    <View style={styles.container}>
      {localImageURI ? (
        // Quick Create Interface
        <GradientWrapper style={styles.createContainer}>
          <CreateHeader onCancel={handleCancel} />
          
          <EstimationTab
            description={description}
            onDescriptionChange={handleDescriptionChange}
            imageUrl={localImageURI}
            isUploadingImage={isUploadingImage}
            textInputRef={textInputRef}
            inputAccessoryViewID={inputAccessoryViewID}
          />

          <KeyboardStickyView offset={{ closed: -30, opened: -10 }}>
            <KeyboardAccessory
              onEstimate={handleEstimation}
              estimateLabel={estimateLabel}
              canContinue={canContinue}
            />
          </KeyboardStickyView>
        </GradientWrapper>
      ) : (
        // Camera Interface
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
          
          <RoundButton
            Icon={X}
            style={styles.closeButton}
            onPress={handleCancel}
            variant="secondary"
          />
        </>
      )}
    </View>
  );
}

const createStyles = (colors: Colors, theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    createContainer: {
      flex: 1,
      paddingTop: theme.spacing.md,
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
