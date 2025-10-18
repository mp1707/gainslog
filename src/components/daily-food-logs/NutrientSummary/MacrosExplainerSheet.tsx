import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from "react-native";
import { BottomSheet, Host } from "@expo/ui/swift-ui";
import { X } from "lucide-react-native";

import { DotProgressIndicator } from "@/components/explainer-macros/DotProgressIndicator";
import { MacrosOverview } from "@/components/explainer-macros/MacrosOverview";
import { CaloriesExplainer } from "@/components/explainer-macros/CaloriesExplainer";
import { ProteinExplainer } from "@/components/explainer-macros/ProteinExplainer";
import { FatExplainer } from "@/components/explainer-macros/FatExplainer";
import { CarbsExplainer } from "@/components/explainer-macros/CarbsExplainer";
import { DynamicRoundButton } from "@/components/shared/DynamicRoundButton";
import { Colors, Theme, useTheme } from "@/theme";
import { background } from "@expo/ui/swift-ui/modifiers";

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

interface MacrosExplainerSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MacrosExplainerSheet: React.FC<MacrosExplainerSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme, colors } = useTheme();
  const styles = useMemo(() => createStyles(theme, colors), [theme, colors]);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Hardcoded example values for testing
  const total = 1850;
  const target = 2000;
  const percentage = 93;

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
    <Host style={{ position: "absolute", width: SCREEN_WIDTH }}>
      <BottomSheet
        isOpened={isOpen}
        onIsOpenedChange={(opened) => {
          if (!opened) {
            onClose();
          }
        }}
        presentationDragIndicator="visible"
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <DotProgressIndicator
                currentPage={currentPage}
                totalPages={PAGES.length}
              />
            </View>
            <View style={styles.closeButton}>
              <DynamicRoundButton
                variant="secondary"
                controlSize="small"
                systemIcon="xmark"
                legacyIcon={X}
                onPress={onClose}
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
        </View>
      </BottomSheet>
    </Host>
  );
};

const createStyles = (theme: Theme, colors: Colors) =>
  StyleSheet.create({
    container: {},
    header: {
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      zIndex: 10,
    },
    progressContainer: {
      paddingTop: theme.spacing.md,
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
