/**
 * Currency Configuration for the entire application
 * Currency: PKR (Pakistani Rupee)
 */

export const CURRENCY = {
  symbol: 'Rs', // Pakistani Rupee symbol
  code: 'PKR', // Currency code ISO 4217
  name: 'Pakistani Rupee',
  locale: 'ur-PK', // Urdu - Pakistan locale
};

/**
 * Format amount with currency symbol
 * @param amount Amount to format
 * @returns Formatted string like "Rs 1,000"
 */
export function formatCurrency(amount: number): string {
  return `${CURRENCY.symbol} ${amount.toLocaleString('ur-PK')}`;
}
