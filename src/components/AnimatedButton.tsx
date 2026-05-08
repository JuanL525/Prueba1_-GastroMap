// src/components/AnimatedButton.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

// Convertimos Pressable en un componente animable
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  flex?: boolean;
};

export default function AnimatedButton({ label, onPress, variant = 'primary', flex = false }: Props) {
  // Estado compartido para la animación de escala
  const scale = useSharedValue(1);

  // Estilo animado que reacciona al valor de scale
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Funciones para manejar el toque
  const handlePressIn = () => {
    scale.value = withSpring(0.95); // Se encoge ligeramente al tocar
  };

  const handlePressOut = () => {
    scale.value = withSpring(1); // Vuelve a su tamaño normal
  };

  const isPrimary = variant === 'primary';
  
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={`py-4 rounded-xl items-center justify-center ${flex ? 'flex-1' : 'w-full'} ${
        isPrimary ? 'bg-[#006491]' : 'bg-[#F5F5F5]'
      }`}
    >
      <Text 
        className={`font-bold text-lg ${
          isPrimary ? 'text-white' : 'text-[#1A1A1A]'
        }`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}