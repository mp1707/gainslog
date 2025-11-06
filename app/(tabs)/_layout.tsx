import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  NativeTabs,
  Label,
  Icon,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useTheme } from "@/theme";
import { isLiquidGlassAvailable } from "expo-glass-effect";

export default function TabsLayout() {
  const { colors, colorScheme } = useTheme();
  const hasLiquidGlass = isLiquidGlassAvailable();

  return (
    <NativeTabs
      blurEffect={colorScheme}
      minimizeBehavior="onScrollDown"
      labelStyle={
        !hasLiquidGlass
          ? {
              color: colors.secondaryText,
            }
          : undefined
      }
      iconColor={!hasLiquidGlass ? colors.secondaryText : undefined}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <Icon
          src={{
            default: (
              <VectorIcon
                family={MaterialCommunityIcons}
                name="notebook-outline"
              />
            ),
            selected: (
              <VectorIcon family={MaterialCommunityIcons} name="notebook" />
            ),
          }}
          selectedColor={colors.accent}
        />
        <Label selectedStyle={{ color: colors.accent }}>Logging</Label>
      </NativeTabs.Trigger>

      {/* <NativeTabs.Trigger name="favorites">
        <Icon
          src={{
            default: (
              <VectorIcon family={MaterialCommunityIcons} name="star-outline" />
            ),
            selected: (
              <VectorIcon family={MaterialCommunityIcons} name="star" />
            ),
          }}
          selectedColor={colors.accent}
        />
        <Label selectedStyle={{ color: colors.accent }}>Favorites</Label>
      </NativeTabs.Trigger> */}

      <NativeTabs.Trigger name="calendar">
        <Icon
          src={{
            default: (
              <VectorIcon
                family={MaterialCommunityIcons}
                name="calendar-outline"
              />
            ),
            selected: (
              <VectorIcon family={MaterialCommunityIcons} name="calendar" />
            ),
          }}
          selectedColor={colors.accent}
        />
        <Label selectedStyle={{ color: colors.accent }}>Calendar</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon
          src={{
            default: (
              <VectorIcon family={MaterialCommunityIcons} name="cog-outline" />
            ),
            selected: <VectorIcon family={MaterialCommunityIcons} name="cog" />,
          }}
          selectedColor={colors.accent}
        />
        <Label selectedStyle={{ color: colors.accent }}>Settings</Label>
      </NativeTabs.Trigger>
      {/* <NativeTabs.Trigger
        name="favorites"
        role={hasLiquidGlass ? "search" : undefined}
      >
        <Label>New</Label>
        <Icon sf="plus" selectedColor={colors.accent} />
      </NativeTabs.Trigger> */}
    </NativeTabs>
  );
}
