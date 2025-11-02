// import { Platform } from "react-native";
// import { Stack, useRouter } from "expo-router";
// import { useTheme } from "@/theme";
// import { isLiquidGlassAvailable } from "expo-glass-effect";
// import { ChevronLeft } from "lucide-react-native";

// export default function FavoritesLayout() {
//   const { colors, theme } = useTheme();
//   const router = useRouter();
//   const isIOS = Platform.OS === "ios";
//   const hasLiquidGlass = isLiquidGlassAvailable();

//   return (
//     <Stack
//       screenOptions={{
//         headerTransparent: isIOS && hasLiquidGlass,
//         headerStyle: !hasLiquidGlass && {
//           backgroundColor: colors.primaryBackground,
//         },
//         headerShadowVisible: true,
//         headerTitleStyle: {
//           color: colors.primaryText,
//           fontFamily: theme.typography.Headline.fontFamily,
//           fontSize: theme.typography.Headline.fontSize,
//           fontWeight: theme.typography.Headline.fontWeight,
//         },
//         headerLargeTitleStyle: {
//           color: colors.primaryText,
//           fontFamily: theme.typography.Title1.fontFamily,
//           fontSize: theme.typography.Title1.fontSize,
//           fontWeight: theme.typography.Title1.fontWeight,
//         },
//         contentStyle: { backgroundColor: colors.primaryBackground },
//         presentation: "modal",
//         headerLeft: () => (
//           <ChevronLeft
//             style={{ marginLeft: 5 }}
//             color={colors.primaryText}
//             onPress={() => router.back()}
//           />
//         ),
//       }}
//     >
//       <Stack.Screen
//         name="index"
//         options={{
//           title: "New Log",
//           headerLargeTitle: isIOS,
//           headerLargeTitleShadowVisible: false,
//           presentation: "modal",
//         }}
//       />
//     </Stack>
//   );
// }
