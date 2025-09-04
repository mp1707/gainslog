import { Tabs, usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { CustomTabBar } from "@/components/custom-tab-bar";


// --- MAIN LAYOUT ---
export default function TabLayout() {
  const { safePush } = useNavigationGuard();
  const pathname = usePathname();
  const router = useRouter();

  const segments = ["Log", "Overview"];
  
  const selectedIndex = useMemo(() => {
    if (pathname === "/" || pathname === "/index") {
      return 0; // Log
    } else if (pathname === "/overview") {
      return 1; // Overview
    }
    return 0; // Default to Log
  }, [pathname]);

  const handleSegmentChange = (index: number) => {
    if (index === 0) {
      router.push("/");
    } else if (index === 1) {
      router.push("/overview");
    }
  };

  const handleNewPress = () => {
    safePush("/create");
  };

  const customTabBar = () => (
    <CustomTabBar
      selectedIndex={selectedIndex}
      onSegmentChange={handleSegmentChange}
      onNewPress={handleNewPress}
      segments={segments}
    />
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={customTabBar}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="overview" />
      <Tabs.Screen name="new" options={{ href: null }} />
      {/* <Tabs.Screen name="settings" options={{ href: null }} /> */}
      {/* <Tabs.Screen name="pro" options={{ href: null }} /> */}
    </Tabs>
  );
}
