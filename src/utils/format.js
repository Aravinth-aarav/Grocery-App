/**
 * src/utils/format.js
 * Currency and text formatting utilities for Indian Rupee (₹).
 */

/**
 * Formats a number or numeric string into Indian Rupee format.
 * Example: 180 -> "₹180", 1500.5 -> "₹1,500.50"
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  const numericAmount = Number(amount) || 0;
  
  // Format with en-IN locale
  const formatted = numericAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(numericAmount) ? 0 : 2,
  });

  return `₹${formatted}`;
}

export default {
  formatPrice,
};
