import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { Card } from "@/components/Card";
import { Mic, Camera, Pencil } from "lucide-react-native";
import { useTranslation } from "react-i18next";

interface WelcomeCard3Props {
  width: number;
}

export const WelcomeCard3: React.FC<WelcomeCard3Props> = ({ width }) => {
  const { colors, theme, colorScheme } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();

  // Calculate ring size to match Card 2 dimensions
  const containerWidth = width - theme.spacing.pageMargins.horizontal * 2;
  const ringSize = Math.min(
    (containerWidth - theme.spacing.lg) / 2,
    screenWidth * 0.42
  );

  const styles = useMemo(
    () => createStyles(theme, colors, ringSize),
    [theme, colors, ringSize]
  );

  return (
    <View style={[styles.container, { width }]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <AppText role="Title2" color="primary" style={styles.title}>
            {t("welcome.card3.title")}
          </AppText>
          <AppText role="Body" color="secondary" style={styles.subtitle}>
            {t("welcome.card3.subtitle")}
          </AppText>
        </View>

        <View style={styles.imageSection}>
          <Card elevated={true} style={styles.imageCard}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80",
              }}
              style={styles.foodImage}
              resizeMode="cover"
            />
          </Card>

          {/* Action Buttons Row */}
          <View style={styles.buttonsRow}>
            <MockActionButton
              icon={Pencil}
              color={colors.error}
              colorScheme={colorScheme}
            />
            <MockActionButton
              icon={Mic}
              color={colors.accent}
              colorScheme={colorScheme}
            />
            <MockActionButton
              icon={Camera}
              color={colors.accent}
              colorScheme={colorScheme}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

// Mock action button that looks like HeaderButton but is non-functional
interface MockActionButtonProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
  colorScheme: "light" | "dark";
  highlighted?: boolean;
}

const MockActionButton: React.FC<MockActionButtonProps> = ({
  icon: Icon,
  color,
  colorScheme,
  highlighted = false,
}) => {
  const { colors } = useTheme();
  const isIOS = Platform.OS === "ios";
  const isDark = colorScheme === "dark";

  const iconColor = highlighted
    ? colors.primaryBackground
    : isDark
    ? "rgba(255, 255, 255, 0.85)"
    : color;

  return (
    <View
      style={[
        mockButtonStyles.button,
        {
          backgroundColor: highlighted
            ? color
            : isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.05)",
          borderWidth: isIOS && !highlighted ? 0.5 : 0,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.15)"
            : "rgba(0, 0, 0, 0.1)",
          // Apply subtle shadow in light mode only
          ...(isDark
            ? {
                shadowColor: "transparent",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0,
                shadowRadius: 0,
                elevation: 0,
              }
            : {
                shadowColor: "rgba(0, 0, 0, 0.08)",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 6,
                elevation: 2,
              }),
        },
      ]}
    >
      <Icon size={18} color={iconColor} />
    </View>
  );
};

const mockButtonStyles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});

type Theme = ReturnType<typeof useTheme>["theme"];
type Colors = ReturnType<typeof useTheme>["colors"];

const createStyles = (theme: Theme, colors: Colors, imageHeight: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
    },
    content: {
      width: "100%",
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      gap: theme.spacing.lg,
    },
    textContainer: {
      alignItems: "center",
      gap: theme.spacing.sm,
      minHeight: 80, // Ensure consistent title area height
    },
    title: {
      textAlign: "center",
    },
    subtitle: {
      textAlign: "center",
      maxWidth: "85%",
    },
    imageSection: {
      alignItems: "center",
      gap: theme.spacing.md,
    },
    imageLabel: {
      textAlign: "center",
      letterSpacing: 1.2,
    },
    imageCard: {
      width: "100%",
      height: imageHeight,
      padding: 0,
      overflow: "hidden",
    },
    foodImage: {
      width: "100%",
      height: "100%",
      borderRadius: theme.components.cards.cornerRadius,
    },
    buttonsRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      justifyContent: "center",
      paddingTop: theme.spacing.sm,
    },
  });
