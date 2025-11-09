import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme";
import { AppText } from "@/components";
import { Button } from "@/components/shared/Button/Button";
import { DotProgressIndicator } from "@/components/explainer-macros/DotProgressIndicator";
import { WelcomeCard1 } from "./WelcomeCard1";
import { WelcomeCard2 } from "./WelcomeCard2";
import { WelcomeCard3 } from "./WelcomeCard3";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

const CARDS = [
  { id: "1", component: WelcomeCard1 },
  { id: "2", component: WelcomeCard2 },
  { id: "3", component: WelcomeCard3 },
] as const;

export const WelcomeScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);

  // Track viewable items for pagination indicator
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderCard = useCallback(
    ({ item }: { item: (typeof CARDS)[number] }) => {
      const CardComponent = item.component;
      return <CardComponent width={SCREEN_WIDTH} />;
    },
    [SCREEN_WIDTH]
  );

  const handleContinue = useCallback(() => {
    // Navigate to onboarding to set up nutrition goals
    router.push("/onboarding");
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AppText role="Title1" color="primary" style={styles.headerTitle}>
          {t("welcome.screen.title")}
        </AppText>
        <AppText role="Body" color="secondary" style={styles.headerSubtitle}>
          {t("welcome.screen.subtitle")}
        </AppText>
      </View>

      {/* Cards Carousel */}
      <View style={styles.carouselContainer}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <DotProgressIndicator
            currentPage={currentPage}
            totalPages={CARDS.length}
          />
        </View>
        <FlatList
          data={CARDS}
          renderItem={renderCard}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          snapToInterval={SCREEN_WIDTH}
          decelerationRate="fast"
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          keyExtractor={(item) => item.id}
        />
      </View>
      {/* Sticky CTA at Bottom */}
      <View
        style={[
          styles.ctaContainer,
          { paddingBottom: insets.bottom + theme.spacing.xxl * 2 },
        ]}
      >
        <View style={styles.ctaContent}>
          <Button
            label={t("welcome.screen.cta.primary")}
            variant="primary"
            onPress={handleContinue}
            style={styles.ctaButton}
          />
          <AppText role="Caption" color="secondary" style={styles.ctaSubtitle}>
            {t("welcome.screen.cta.secondary")}
          </AppText>
        </View>
      </View>
    </View>
  );
};

type Theme = ReturnType<typeof useTheme>["theme"];
type Colors = ReturnType<typeof useTheme>["colors"];

const createStyles = (theme: Theme, colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primaryBackground,
    },
    header: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.md,
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    headerTitle: {
      textAlign: "center",
    },
    headerSubtitle: {
      textAlign: "center",
    },
    carouselContainer: {
      flex: 1,
      gap: theme.spacing.lg,
    },
    progressContainer: {
      paddingTop: theme.spacing.xxl + theme.spacing.md,
      alignItems: "center",
    },
    ctaContainer: {
      paddingHorizontal: theme.spacing.pageMargins.horizontal,
      paddingTop: theme.spacing.md,
      backgroundColor: colors.primaryBackground,
    },
    ctaContent: {
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    ctaButton: {
      width: "100%",
    },
    ctaSubtitle: {
      textAlign: "center",
    },
  });
