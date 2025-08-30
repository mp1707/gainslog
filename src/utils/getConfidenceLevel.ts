import { useTheme } from "@/theme";

export interface ConfidenceLevelInfo {
  confidenceLevel: 0 | 1 | 2 | 3; // 0=uncertain, 1=low, 2=medium, 3=high
  color: {
    background: string;
    text: string;
  };
}

/**
 * Simple utility to get confidence level and colors from estimation confidence
 * @param estimationConfidence - Confidence value (0-100) or undefined
 * @returns Object with confidence level (0-3) and theme colors
 */
export const getConfidenceLevel = (estimationConfidence?: number): ConfidenceLevelInfo => {
  const { colors } = useTheme();
  
  // Handle undefined/null or 0 as uncertain
  if (!estimationConfidence || estimationConfidence === 0) {
    return {
      confidenceLevel: 0,
      color: {
        background: colors.confidence.uncertain.background,
        text: colors.confidence.uncertain.text,
      },
    };
  }
  
  // High confidence: 80-100
  if (estimationConfidence >= 80) {
    return {
      confidenceLevel: 3,
      color: {
        background: colors.confidence.high.background,
        text: colors.confidence.high.text,
      },
    };
  }
  
  // Medium confidence: 60-79
  if (estimationConfidence >= 60) {
    return {
      confidenceLevel: 2,
      color: {
        background: colors.confidence.medium.background,
        text: colors.confidence.medium.text,
      },
    };
  }
  
  // Low confidence: 1-59
  return {
    confidenceLevel: 1,
    color: {
      background: colors.confidence.low.background,
      text: colors.confidence.low.text,
    },
  };
};