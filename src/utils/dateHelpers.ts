/**
 * Date utility functions for the app
 */

/**
 * Formats a date into ISO date string (YYYY-MM-DD)
 */
export const formatDateKey = (
  year: number,
  month: number,
  day: number
): string => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
};

/**
 * Parses an ISO date string into components
 */
export const parseDateKey = (
  dateKey: string
): { year: number; month: number; day: number } => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
};

/**
 * Gets the number of days in a given month
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

/**
 * Formats a date for display (e.g., "Jan 15, 2024")
 */
export const formatDisplayDate = (dateKey: string): string => {
  const date = new Date(dateKey + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Gets today's date as an ISO date string in local timezone
 */
export const getTodayKey = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a date is today
 */
export const isToday = (dateKey: string): boolean => {
  return dateKey === getTodayKey();
};

/**
 * Gets the start and end of a month as ISO date strings
 */
export const getMonthBounds = (
  year: number,
  month: number
): { start: string; end: string } => {
  const start = formatDateKey(year, month, 1);
  const end = formatDateKey(year, month, getDaysInMonth(year, month));
  return { start, end };
};

/**
 * Navigates to the next or previous day
 */
export const navigateDate = (
  currentDate: string,
  direction: "next" | "prev"
): string => {
  const date = new Date(currentDate + "T00:00:00");
  date.setDate(date.getDate() + (direction === "next" ? 1 : -1));
  return formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

/**
 * Gets the day of week name (e.g., "Monday")
 */
export const getDayOfWeek = (dateKey: string): string => {
  const date = new Date(dateKey + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

/**
 * Gets a relative date string (e.g., "Today", "Yesterday", "2 days ago")
 */
export const getRelativeDate = (dateKey: string): string => {
  const today = new Date(getTodayKey() + "T00:00:00");
  const date = new Date(dateKey + "T00:00:00");
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays === -1) return "Tomorrow";
  if (diffDays > 0) return `${diffDays} days ago`;
  return `In ${Math.abs(diffDays)} days`;
};
