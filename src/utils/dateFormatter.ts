export function formatDate(dateString: string): string {
  try {
    // Handle locale string format (e.g. "2024/3/14 12:34")
    if (dateString.includes('/')) {
      return dateString;
    }

    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateString;
    }

    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date).replace(/\//g, '/');
  } catch (error) {
    // If any error occurs, return the original string
    return dateString;
  }
}