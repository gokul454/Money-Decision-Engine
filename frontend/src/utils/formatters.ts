export function formatCurrency(amount: number | undefined | null, currency: string = 'INR'): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : '₹';
  const formatted = Math.abs(amount).toLocaleString('en-IN');
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function formatDateRelative(dateString: string | Date): string {
  const d = new Date(dateString);
  const now = new Date();

  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  const yesterday = new Date(now.getTime() - 86400000);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatTimeAgo(dateString: string | Date): string {
  const d = new Date(dateString);
  const diffMs = Date.now() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return 'Just now';
}
