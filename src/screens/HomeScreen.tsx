// src/screens/HomeScreen.tsx
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import DishList from '../components/DishList';
import { useAuth } from '../hooks/useAuth';
import { useDishes } from '../hooks/useDishes';

export default function HomeScreen({ navigation }: any) {
  // Extraemos también "loading" de useAuth
  const { user, loading: authLoading, signOut } = useAuth();
  
  // Usamos user?.id con un fallback ('') para que no colapse si user es null
  const { dishes, isLoading, deleteDish } = useDishes(user?.id ?? '');

  // 1. Mostrar pantalla de carga mientras Supabase verifica la sesión
  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#006491" />
      </View>
    );
  }

  // 2. Si no hay usuario, puedes retornar nulo o manejar la redirección. 
  // (Asumiendo que Expo Router ya protege la ruta en tu _layout, esto es solo por seguridad)
  if (!user) return null; 

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-xl font-bold">🍕 Gastro Map</Text>
          <Text className="text-white text-xs opacity-80">{user.email}</Text>
        </View>
        <Pressable onPress={signOut} className="bg-white/20 px-3 py-2 rounded-lg">
          <Text className="text-white text-sm font-medium">Salir</Text>
        </Pressable>
      </View>

      {/* Lista de platos */}
      <View className="flex-1 px-6 pt-6">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#6B7280]">Cargando platos...</Text>
          </View>
        ) : (
          <DishList dishes={dishes} onDelete={deleteDish} />
        )}
      </View>

      {/* Botón flotante agregar */}
      <Pressable
        className="absolute bottom-8 right-6 bg-[#E31837] w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => navigation.navigate('AddDish')}
      >
        <Text className="text-white text-3xl font-light">+</Text>
      </Pressable>
    </View>
  );
}