// src/utils/dateUtils.js

/**
 * Convert a Date object to a local YYYY-MM-DD string
 * Avoids UTC offset issues
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

/**
 * Get today's date as a YYYY-MM-DD string
 */
export const todayDateStr = () => formatDate(new Date());
