/**
 * Calculate relative time from a given date
 * @param {Date|string} date - The date to calculate relative time from
 * @returns {string} - Relative time string (e.g., "2 hours ago", "1 day ago", "5 minutes ago")
 */
export const getRelativeTime = (date) => {
  if (!date) {
    console.log('getRelativeTime: No date provided');
    return '';
  }
  
  const now = new Date();
  const uploadDate = new Date(date);
  const diffInMs = now - uploadDate;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  let result;
  if (diffInYears > 0) {
    result = `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
  } else if (diffInMonths > 0) {
    result = `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  } else if (diffInWeeks > 0) {
    result = `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffInDays > 0) {
    result = `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffInHours > 0) {
    result = `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffInMinutes > 0) {
    result = `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  } else {
    result = 'Just now';
  }

  console.log(`getRelativeTime: ${date} -> ${result} (${diffInMs}ms difference)`);
  return result;
}; 