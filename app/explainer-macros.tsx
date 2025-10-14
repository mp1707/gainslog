import React, { useRef, useState, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, Dimensions, ViewToken } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { X } from "lucide-react-native";

import { GradientWrapper } from "@/components/shared/GradientWrapper";
import { RoundButton } from "@/components/shared/RoundButton";
import { DotProgressIndicator } from "@/components/explainer-macros/DotProgressIndicator";
import { MacrosOverview } from "@/components/explainer-macros/MacrosOverview";
import { CaloriesExplainer } from "@/components/explainer-macros/CaloriesExplainer";
import { ProteinExplainer } from "@/components/explainer-macros/ProteinExplainer";
import { FatExplainer } from "@/components/explainer-macros/FatExplainer";
import { CarbsExplainer } from "@/components/explainer-macros/CarbsExplainer";
import { Theme, useTheme } from "@/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ExplainerPage {
  id: string;
  component: React.ComponentType<any>;
}

const PAGES: ExplainerPage[] = [
  { id: "macros", component: MacrosOverview },
  { id: "calories", component: CaloriesExplainer },
  { id: "protein", component: ProteinExplainer },
  { id: "fat", component: FatExplainer },
  { id: "carbs", component: CarbsExplainer },
];

export default function ExplainerMacrosScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const params = useLocalSearchParams<{ total?: string; target?: string; percentage?: string }>();

  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentPage(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  // Parse params for data
  const total = params.total ? parseInt(params.total) : undefined;
  const target = params.target ? parseInt(params.target) : undefined;
  const percentage = params.percentage ? parseInt(params.percentage) : undefined;

  const renderPage = useCallback(
    ({ item }: { item: ExplainerPage }) => {
      const Component = item.component;
      return (
        <View style={styles.pageContainer}>
          <Component total={total} target={target} percentage={percentage} />
        </View>
      );
    },
    [styles.pageContainer, total, target, percentage]
  );

  const keyExtractor = useCallback((item: ExplainerPage) => item.id, []);

  return (
    <GradientWrapper style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <DotProgressIndicator currentPage={currentPage} totalPages={PAGES.length} />
        </View>
        <View style={styles.closeButton}>
          <RoundButton
            onPress={handleClose}
            Icon={X}
            variant="tertiary"
            accessibilityLabel="Close explainer"
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToInterval={SCREEN_WIDTH}
        decelerationRate="fast"
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </GradientWrapper>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      zIndex: 10,
    },
    progressContainer: {
      alignItems: "center",
      width: "100%",
    },
    closeButton: {
      position: "absolute",
      top: theme.spacing.md,
      right: theme.spacing.md,
      zIndex: 15,
    },
    pageContainer: {
      width: SCREEN_WIDTH,
      flex: 1,
    },
  });
