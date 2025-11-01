import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { NativeTabs, Label, Icon, VectorIcon } from 'expo-router/unstable-native-tabs';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { colors, theme } = useTheme();

  return (
    <NativeTabs
      backgroundColor={colors.secondaryBackground}
      tintColor={colors.accent}
      minimizeBehavior="onScrollDown"
      labelStyle={{
        color: colors.secondaryText,
        fontFamily: theme.typography.Caption.fontFamily,
        fontSize: theme.typography.Caption.fontSize,
        fontWeight: theme.typography.Caption.fontWeight,
      }}
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
              <VectorIcon
                family={MaterialCommunityIcons}
                name="notebook"
              />
            ),
          }}
          selectedColor={colors.accent}
        />
        <Label selectedStyle={{ color: colors.accent }}>Logging</Label>
      </NativeTabs.Trigger>

      {/* <NativeTabs.Trigger name="favorites" role="search">
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

      <NativeTabs.Trigger name="settings">
        <Icon
          src={{
            default: (
              <VectorIcon
                family={MaterialCommunityIcons}
                name="cog-outline"
              />
            ),
            selected: (
              <VectorIcon family={MaterialCommunityIcons} name="cog" />
            ),
          }}
          selectedColor={colors.accent}
        />
        <Label selectedStyle={{ color: colors.accent }}>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
