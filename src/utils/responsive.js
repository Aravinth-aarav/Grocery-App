/**
 * src/utils/responsive.js
 * Responsive scaling and grid calculation utilities.
 * Adapts to phone, tablet, portrait, and landscape orientations.
 */

import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base guidelines based on standard phone (e.g. iPhone 11/13/14: 390x844)
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

/**
 * Width percentage to DP
 * @param {number} percent - percentage 0 to 100
 */
export function wp(percent) {
  const { width } = Dimensions.get('window');
  return (percent * width) / 100;
}

/**
 * Height percentage to DP
 * @param {number} percent - percentage 0 to 100
 */
export function hp(percent) {
  const { height } = Dimensions.get('window');
  return (percent * height) / 100;
}

/**
 * Scales font size proportionally based on screen width & pixel density
 * @param {number} size - base font size
 */
export function scaleFont(size) {
  const { width } = Dimensions.get('window');
  const scale = width / guidelineBaseWidth;
  const newSize = size * scale;
  
  // Keep font size within readable bounds
  const clampedSize = Math.max(12, Math.min(newSize, size * 1.35));
  return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
}

/**
 * Determines number of grid columns based on current window width:
 * - width < 600: 2 columns (standard phones)
 * - 600 <= width < 900: 3 columns (large phones landscape / mini tablets)
 * - width >= 900: 4 columns (tablets)
 * @param {number} width
 * @returns {number}
 */
export function getGridColumns(width) {
  const currentWidth = width || Dimensions.get('window').width;
  if (currentWidth >= 900) return 4;
  if (currentWidth >= 600) return 3;
  return 2;
}

/**
 * Calculate dynamic card width based on screen width, padding, and columns
 * @param {number} width - screen width
 * @param {number} padding - horizontal screen padding
 * @param {number} gap - gap between cards
 */
export function getCardWidth(width, padding = 32, gap = 16) {
  const currentWidth = width || Dimensions.get('window').width;
  const columns = getGridColumns(currentWidth);
  const totalGaps = gap * (columns - 1);
  const availableWidth = currentWidth - padding - totalGaps;
  return Math.floor(availableWidth / columns);
}

export default {
  wp,
  hp,
  scaleFont,
  getGridColumns,
  getCardWidth,
};
