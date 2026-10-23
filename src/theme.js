/**
 * src/theme.js
 * Design system configuration according to the Figma specification:
 * - Background gradient: #D9F7B0 (light lime green) -> #FFF1CF (warm cream)
 * - Primary accent: #FFE11A (yellow) for selected chips, round +/- buttons, tab bar
 * - Secondary accent: #C9B72B (olive/mustard) for main buttons (#D6C53A -> #B8A622)
 * - Cards: #FFF8E6 with soft gradient #FFFDF3 -> #FFF1CF, 20px radius, soft shadow
 * - Inactive chips: grey #B9B9AE, Text: dark #1C1C1C, secondary #6B6B60
 * - Round icon buttons: 44x44, white-cream with soft drop shadow
 */

import COLORS from './theme/colors';
import FONTS from './theme/fonts';

export { COLORS } from './theme/colors';
export { FONTS } from './theme/fonts';

export const THEME = {
  colors: COLORS,
  fonts: FONTS,
};

export default COLORS;
