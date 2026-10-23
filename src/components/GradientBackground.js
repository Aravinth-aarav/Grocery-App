/**
 * GradientBackground.js
 * Universal screen wrapper providing the Figma signature background gradient:
 * #D9F7B0 (light lime green) at the top -> #FFF1CF (warm cream) at the bottom.
 */

import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

export default function GradientBackground({
  children,
  style,
  safe = true,
  statusBarStyle = 'dark-content',
}) {
  const content = safe ? (
    <SafeAreaView style={[styles.safeArea, style]}>
      {children}
    </SafeAreaView>
  ) : (
    <View style={[styles.safeArea, style]}>
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={COLORS.bgGradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle={statusBarStyle} backgroundColor="transparent" translucent />
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
});
