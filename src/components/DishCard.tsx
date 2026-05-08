// src/components/DishCard.tsx
// Animación 2: FadeOutLeft al eliminar con swipe
import { Image, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    FadeOutLeft,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { Dish } from '../types';

interface Props {
  dish: Dish;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = -120;

export default function DishCard({ dish, onDelete }: Props) {
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationX < 0) {
        translateX.value = e.translationX;
      }
    })
    .onEnd((e) => {
      if (e.translationX < SWIPE_THRESHOLD) {
        runOnJS(onDelete)(dish.id);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        exiting={FadeOutLeft}
        style={animatedStyle}
        className="bg-white rounded-2xl mb-4 overflow-hidden border border-[#F5F5F5]"
      >
        {dish.photo_uri && (
          <Image
            source={{ uri: dish.photo_uri }}
            className="w-full h-44"
            resizeMode="cover"
          />
        )}
        <View className="p-4">
          <Text className="text-lg font-bold text-[#1A1A1A]">{dish.name}</Text>
          <Text className="text-[#6B7280] text-sm mt-1">
            📍 {dish.city ?? 'Ciudad desconocida'}{dish.country ? `, ${dish.country}` : ''}
          </Text>
          <Text className="text-[#6B7280] text-xs mt-1">
            {new Date(dish.created_at).toLocaleDateString('es-EC', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Text className="text-[#E31837] text-xs mt-3">← Desliza para eliminar</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
