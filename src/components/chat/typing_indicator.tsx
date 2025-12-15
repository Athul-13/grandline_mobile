/**
 * Typing Indicator Component
 * Shows animated bouncing dots when someone is typing
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/use-theme';

export const TypingIndicator: React.FC = () => {
  const { theme } = useTheme();
  
  // Create animated values for 3 dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Create bouncing animation for a single dot
    const createBounceAnimation = (animatedValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: -8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };
    
    // Start animations with staggered delays (like web: -0.3s, -0.15s, 0s)
    const anim1 = createBounceAnimation(dot1, 0);
    const anim2 = createBounceAnimation(dot2, 150);
    const anim3 = createBounceAnimation(dot3, 300);
    
    anim1.start();
    anim2.start();
    anim3.start();
    
    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [dot1, dot2, dot3]);
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: theme.textSecondary,
            transform: [{ translateY: dot1 }] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: theme.textSecondary,
            transform: [{ translateY: dot2 }] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: theme.textSecondary,
            transform: [{ translateY: dot3 }] 
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

