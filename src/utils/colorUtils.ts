/**
 * Color utility functions for manipulating hex colors
 * Extracted from ProgressRings components to avoid duplication
 */

/**
 * Converts a hex color string to RGB components
 * Supports both 3-digit (#RGB) and 6-digit (#RRGGBB) hex formats
 */
export const hexToRgb = (hexColor: string): { r: number; g: number; b: number } => {
  const hex = hexColor.replace("#", "");
  const normalized =
    hex.length === 3
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const intVal = parseInt(normalized, 16);
  const r = (intVal >> 16) & 255;
  const g = (intVal >> 8) & 255;
  const b = intVal & 255;
  return { r, g, b };
};

/**
 * Converts RGB color components to a hex color string
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => {
    const safe = Math.round(Math.max(0, Math.min(255, value)));
    return safe.toString(16).padStart(2, "0");
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Adjusts the brightness of a hex color
 * @param hexColor - The hex color to adjust
 * @param amount - Amount to adjust (-1 to 1, negative darkens, positive lightens)
 */
export const adjustColor = (hexColor: string, amount: number): string => {
  const { r, g, b } = hexToRgb(hexColor);
  const scaleChannel = (value: number) => {
    if (amount >= 0) {
      return value + (255 - value) * amount;
    }
    return value * (1 + amount);
  };
  return rgbToHex(scaleChannel(r), scaleChannel(g), scaleChannel(b));
};

/**
 * Interpolates between two hex colors
 * @param from - Starting hex color
 * @param to - Ending hex color
 * @param t - Interpolation factor (0-1)
 */
export const interpolateColor = (from: string, to: string, t: number): string => {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  const mix = (a: number, b: number) => a + (b - a) * t;
  return rgbToHex(
    mix(fromRgb.r, toRgb.r),
    mix(fromRgb.g, toRgb.g),
    mix(fromRgb.b, toRgb.b)
  );
};
