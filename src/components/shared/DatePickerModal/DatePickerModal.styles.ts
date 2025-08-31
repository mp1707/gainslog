import { StyleSheet, Dimensions } from 'react-native';
import { theme } from '@/theme';
import type { Colors } from '@/theme/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
const BOTTOM_SHEET_HEIGHT = 320;

export const createStyles = (colors: Colors, themeObj: typeof theme, colorScheme: "light" | "dark") =>
  StyleSheet.create({
    bottomSheetOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: screenWidth,
      height: screenHeight,
      zIndex: 9999,
      elevation: 9999,
    },
    bottomSheetBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    bottomSheetContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.secondaryBackground,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: colors.primaryText,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: colorScheme === "dark" ? 0.3 : 0.1,
      shadowRadius: 16,
      elevation: 20,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      minHeight: BOTTOM_SHEET_HEIGHT,
      zIndex: 10000,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.secondaryText + "40",
      borderRadius: 2,
      alignSelf: "center",
      marginTop: themeObj.spacing.sm,
      marginBottom: themeObj.spacing.md,
    },
    sheetContent: {
      paddingHorizontal: themeObj.spacing.lg,
      paddingBottom: themeObj.spacing.lg,
    },
    sheetTitle: {
      textAlign: "center",
      color: colors.primaryText,
      marginBottom: themeObj.spacing.md,
    },
  });