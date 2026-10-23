/**
 * Color palette based on Figma design specification:
 * - Background gradient: #D9F7B0 (light lime green) -> #FFF1CF (warm cream)
 * - Primary accent: #FFE11A (yellow) for selected chips, +/- steppers, and tab bar
 * - Secondary accent: #C9B72B (olive/mustard) for main buttons (#D6C53A -> #B8A622)
 * - Cards: #FFF8E6 with soft gradient #FFFDF3 -> #FFF1CF, 20px radius
 * - Inactive chips: #B9B9AE
 * - Text: dark #1C1C1C, secondary #6B6B60
 */

export const COLORS = {
  // Figma Theme Accents
  primary: '#C9B72B', // Olive/mustard primary
  primaryDark: '#B8A622',
  primaryLight: '#D6C53A',
  accentYellow: '#FFE11A', // Yellow accent for selected chips, steppers, and tab bar
  accentOlive: '#C9B72B', // Olive/mustard accent for main action buttons

  // Signature Gradients
  bgGradient: ['#D9F7B0', '#FFF1CF'], // Light lime green -> warm cream (Universal screen background)
  buttonGradient: ['#D6C53A', '#B8A622'], // Olive action button gradient (#D6C53A -> #B8A622)
  cardGradient: ['#FFFDF3', '#FFF1CF'], // Cream card soft gradient (#FFFDF3 -> #FFF1CF)
  tabGradient: ['#FFE11A', '#FFD800'],
  greenGradient: ['#86D84C', '#53B175'],
  gradientGreen: ['#86D84C', '#53B175'], // Alias for Logo and badges

  // Neutrals & Surfaces
  white: '#FFFFFF',
  card: '#FFF8E6', // Cream card base
  cardSurface: '#FFFDF3',
  cream: '#FFF1CF',
  lightLime: '#D9F7B0',
  inactiveChip: '#B9B9AE', // Inactive chip grey
  inactiveChipBg: 'rgba(255, 255, 255, 0.75)',
  chipActiveBg: '#FFE11A',
  border: '#E8E4D5',
  borderGlass: 'rgba(255, 255, 255, 0.65)',
  glassInput: 'rgba(255, 255, 255, 0.75)', // Glass-style 70-75% white
  divider: '#E5DFC8',

  // Typography
  textPrimary: '#1C1C1C', // Dark #1C1C1C
  textSecondary: '#6B6B60', // Secondary #6B6B60
  textHint: '#9C9C92',
  textOnYellow: '#1C1C1C',
  textOnOlive: '#FFFFFF',

  // Status & Highlights
  error: '#E53935',
  errorLight: '#FFEBEE',
  success: '#43A047',
  warning: '#FB8C00',
  heart: '#F44336',
  star: '#FFB300',
  badge: '#E53935',
  tabIndicator: '#E53935', // Red indicator dot on active tab

  // Shadows & Overlays
  shadow: 'rgba(28, 28, 28, 0.08)',
  shadowMedium: 'rgba(28, 28, 28, 0.14)',
  overlay: 'rgba(28, 28, 28, 0.45)',
};

export default COLORS;
