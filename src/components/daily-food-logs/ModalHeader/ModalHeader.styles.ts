import { StyleSheet } from "react-native";
import { useThemedStyles } from "@/theme";

export const useStyles = () =>
  useThemedStyles((colors, theme) =>
    StyleSheet.create({
      // Modal header
      header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
      },

      closeButtonContainer: {},
      invisibleCloseButton: { opacity: 0 },
      centerContainer: {
        // flex: 1,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
      },

      title: {
        fontSize: theme.typography.Title2.fontSize,
        fontFamily: theme.typography.Title2.fontFamily,
        fontWeight: theme.typography.Title2.fontWeight,
        color: colors.primaryText,
      },
    })
  );
