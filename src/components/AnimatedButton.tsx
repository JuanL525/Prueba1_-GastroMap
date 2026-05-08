// src/components/AnimatedButton.tsx
// Animación 3: withSpring en el botón al presionar
import { Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export default function AnimatedButton({ label, onPress, variant = 'primary' }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.93, {}, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  const bgColor = variant === 'primary' ? 'bg-[#006491]' : 'bg-[#E31837]';

  return (
    <Animated.View style={animatedStyle} className="flex-1">
      <Pressable
        className={`${bgColor} rounded-xl py-3 items-center`}
        onPress={handlePress}
      >
        <Text className="text-white font-semibold text-base">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}
