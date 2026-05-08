// src/components/DishList.tsx
// Animación 1: FadeInDown al agregar un plato nuevo
import { FlatList, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Dish } from '../types';
import DishCard from './DishCard';

interface Props {
  dishes: Dish[];
  onDelete: (id: string) => void;
}

export default function DishList({ dishes, onDelete }: Props) {
  if (dishes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-[#6B7280] text-base">
          Aún no tienes platos registrados 🍽️
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={dishes}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
          <DishCard dish={item} onDelete={onDelete} />
        </Animated.View>
      )}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
