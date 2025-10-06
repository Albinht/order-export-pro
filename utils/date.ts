/**
 * Safely format a date to ISO date string (YYYY-MM-DD)
 * Returns a default value if the date is invalid
 */
export function formatDate(date: string | Date | null | undefined, defaultValue = 'No date'): string {
  if (!date) return defaultValue;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return defaultValue;
  }
  
  return dateObj.toISOString().split('T')[0];
}

/**
 * Safely format a date to time string (HH:MM:SS)
 * Returns a default value if the date is invalid
 */
export function formatTime(date: string | Date | null | undefined, defaultValue = '--:--:--'): string {
  if (!date) return defaultValue;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return defaultValue;
  }
  
  return dateObj.toISOString().split('T')[1].slice(0, 8);
}

/**
 * Safely format a date to datetime string (YYYY-MM-DD HH:MM:SS)
 * Returns a default value if the date is invalid
 */
export function formatDateTime(date: string | Date | null | undefined, defaultValue = 'Never'): string {
  if (!date) return defaultValue;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return defaultValue;
  }
  
  return dateObj.toISOString().replace('T', ' ').slice(0, -5);
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return !isNaN(dateObj.getTime());
}
