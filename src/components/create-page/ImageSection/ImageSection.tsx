import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme";
import { AppText } from "@/components/shared/AppText";
import { ImageDisplay } from "@/components/shared/ImageDisplay";

interface ImageSectionProps {
  imageUrl: string | undefined;
  isProcessing: boolean;
  onRemoveImage: () => void;
  isVisible: boolean;
}

export const ImageSection = ({
  imageUrl,
  isProcessing,
  onRemoveImage,
  isVisible,
}: ImageSectionProps) => {
  const { theme, colors } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!isVisible) return null;

  return (
    <View style={styles.imageSection}>
      <AppText role="Caption" style={[styles.heading, { color: colors.secondaryText }]}>
        {t("createLog.image.title")}
      </AppText>
      <ImageDisplay
        imageUrl={imageUrl}
        isUploading={isProcessing}
        deleteImage={onRemoveImage}
      />
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    imageSection: {
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      flex: 1,
    },
    heading: {
      textTransform: "uppercase",
      letterSpacing: 0.6,
      paddingHorizontal: theme.spacing.lg,
    },
  });
