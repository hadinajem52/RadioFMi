import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const PulsingGlow = React.memo(({ children, isActive }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1);
      glowAnim.setValue(0.3);
      return undefined;
    }

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();
    glowAnimation.start();

    return () => {
      pulseAnimation.stop();
      glowAnimation.stop();
    };
  }, [isActive, pulseAnim, glowAnim]);

  return (
    <Animated.View
      style={{
        transform: [{ scale: pulseAnim }],
        position: 'relative',
      }}
    >
      {isActive && (
        <Animated.View
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: 20,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: '#7C4DFF',
            opacity: glowAnim,
            shadowColor: '#7C4DFF',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 15,
            elevation: 8,
          }}
        />
      )}
      {children}
    </Animated.View>
  );
});

export default PulsingGlow;
