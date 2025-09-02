import { useEffect } from "react";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";

// Redirect to editFat if someone navigates directly to /fatCalculator
export default function FatCalculatorIndexScreen() {
  const { safeReplace } = useNavigationGuard();

  useEffect(() => {
    safeReplace("/settings/fatCalculator/editFat");
  }, [safeReplace]);

  return null;
}
