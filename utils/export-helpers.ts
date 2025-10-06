/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date for display (e.g., "December 5, 2024")
 */
export function formatDisplayDate(date?: Date): string {
  const dateObj = date || new Date();
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get a human-friendly export message
 */
export function getExportMessage(orderCount: number, storeName?: string): string {
  const today = formatDisplayDate();
  if (storeName) {
    return `Exporting ${orderCount} order${orderCount !== 1 ? 's' : ''} from ${storeName} (${today})`;
  }
  return `Exporting ${orderCount} order${orderCount !== 1 ? 's' : ''} (${today})`;
}
