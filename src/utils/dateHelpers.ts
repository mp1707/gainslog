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

/**
 * Smart date formatting function for headers
 * Returns "Today", "Yesterday", or a long format with weekday (e.g., "Monday, Jan 15")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Reset time components for comparison
  const todayDateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayDateOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );
  const inputDateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (inputDateOnly.getTime() === todayDateOnly.getTime()) {
    return "Today";
  } else if (inputDateOnly.getTime() === yesterdayDateOnly.getTime()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }
};

/**
 * Converts a Date object to local date string (YYYY-MM-DD) without timezone conversion
 */
export const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a date is in the future (after today)
 */
export const isFutureDate = (dateKey: string): boolean => {
  const today = new Date(getTodayKey() + "T00:00:00");
  const date = new Date(dateKey + "T00:00:00");
  return date > today;
};

/**
 * Checks if a month is in the future (after current month)
 */
export const isFutureMonth = (year: number, month: number): boolean => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
};

/**
 * Formats year and month into a display string (e.g., "January 2024")
 */
export const formatMonthYear = (year: number, month: number): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[month - 1]} ${year}`;
};

/**
 * Formats year, month, and day into a display string (e.g., "January 15, 2024")
 */
export const formatMonthYearDay = (
  year: number,
  month: number,
  day: number
): string => {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return `${monthNames[month - 1]} ${day}, ${year}`;
};
