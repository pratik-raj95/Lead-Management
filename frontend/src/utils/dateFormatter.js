/**
 * Formats a date string (YYYY-MM-DD) into a human readable format (e.g. "10 July 2026")
 */
export function formatDate(dateString) {
  if (!dateString) return 'Not Scheduled';
  
  try {
    const [year, month, day] = dateString.split('-');
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Formats an ISO datetime string into a shorter readable datetime
 */
export function formatDateTime(isoString) {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

/**
 * Returns today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if a YYYY-MM-DD date string is equal to today's date
 */
export function isDateToday(dateString) {
  if (!dateString) return false;
  return dateString === getTodayDateString();
}
