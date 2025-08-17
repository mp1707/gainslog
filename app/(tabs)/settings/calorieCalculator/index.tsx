import { useEffect } from "react";
import { useNavigationGuard } from "@/shared/hooks/useNavigationGuard";

// Redirect to step 1 if someone navigates directly to /calculator
export default function CalculatorIndexScreen() {
  const { safeReplace } = useNavigationGuard();

  useEffect(() => {
    safeReplace("/settings/calorieCalculator/sex");
  }, [safeReplace]);

  return null;
}