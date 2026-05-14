// src/screens/DishDetailScreen.tsx
import { Image, Pressable, Text, View } from 'react-native';
import DishMapView from '../components/DishMapView';

export default function DishDetailScreen({ navigation, route }: any) {
  const { dish } = route.params;

  if (!dish) return null;

  return (
    <View className="flex-1 bg-white">
      <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-xl font-bold">Detalle del plato</Text>
          <Text className="text-white text-xs opacity-80">{dish.name}</Text>
        </View>
        <Pressable onPress={() => navigation.goBack()} className="bg-white/20 px-3 py-2 rounded-lg">
          <Text className="text-white text-sm">Atrás</Text>
        </Pressable>
      </View>

      {dish.photo_uri ? (
        <Image
          source={{ uri: dish.photo_uri }}
          className="w-full h-56"
          resizeMode="cover"
        />
      ) : null}

      <View className="px-6 py-4">
        <Text className="text-2xl font-bold text-[#1A1A1A] mb-2">{dish.name}</Text>
        <Text className="text-[#6B7280] mb-4">
          {dish.city ?? 'Ciudad desconocida'}{dish.country ? `, ${dish.country}` : ''}
        </Text>
      </View>

      {dish.latitude !== null && dish.longitude !== null ? (
        <DishMapView
          dishLat={dish.latitude}
          dishLng={dish.longitude}
          dishName={dish.name}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-[#6B7280] text-base text-center">
            Este plato no tiene coordenadas guardadas.
          </Text>
        </View>
      )}
    </View>
  );
}
