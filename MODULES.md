# MODULES — Implementación por módulo

Implementa cada módulo en orden. No pases al siguiente hasta completar el actual.

---

## MÓDULO 1: Librerías base (lib/)

### Archivo: `src/lib/supabase.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Archivo: `src/lib/queryClient.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});
```

---

## MÓDULO 2: Autenticación

### Archivo: `src/hooks/useAuth.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, loading, signOut, user: session?.user ?? null };
}
```

### Archivo: `src/navigation/RootNavigator.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Archivo: `src/screens/LoginScreen.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/screens/LoginScreen.tsx
import { View, Text, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import AnimatedButton from '../components/AnimatedButton';

type FormData = { email: string; password: string };

export default function LoginScreen({ navigation }: any) {
  const { control, handleSubmit } = useForm<FormData>();

  const onSubmit = async ({ email, password }: FormData) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-[#006491] mb-2 text-center">
        🍕 Gastro Map
      </Text>
      <Text className="text-[#6B7280] text-center mb-8">
        Registra tus platos favoritos
      </Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: 'El correo es obligatorio' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <TextInput
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#1A1A1A]"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              value={value}
            />
            {error && (
              <Text className="text-[#E31837] text-xs mt-1">{error.message}</Text>
            )}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'La contraseña es obligatoria' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-6">
            <TextInput
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#1A1A1A]"
              placeholder="Contraseña"
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
            {error && (
              <Text className="text-[#E31837] text-xs mt-1">{error.message}</Text>
            )}
          </View>
        )}
      />

      <AnimatedButton label="Iniciar sesión" onPress={handleSubmit(onSubmit)} />

      <Text
        className="text-center text-[#006491] mt-4 py-2"
        onPress={() => navigation.navigate('Register')}
      >
        ¿No tienes cuenta? Regístrate
      </Text>
    </View>
  );
}
```

### Archivo: `src/screens/RegisterScreen.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/screens/RegisterScreen.tsx
import { View, Text, TextInput, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import AnimatedButton from '../components/AnimatedButton';

type FormData = { email: string; password: string; confirm: string };

export default function RegisterScreen({ navigation }: any) {
  const { control, handleSubmit, getValues } = useForm<FormData>();

  const onSubmit = async ({ email, password, confirm }: FormData) => {
    if (password !== confirm) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('¡Cuenta creada!', 'Revisa tu correo para confirmar tu cuenta.');
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-[#006491] mb-8 text-center">
        Crear cuenta
      </Text>

      <Controller
        control={control}
        name="email"
        rules={{ required: 'El correo es obligatorio' }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <TextInput
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#1A1A1A]"
              placeholder="Correo electrónico"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              value={value}
            />
            {error && <Text className="text-[#E31837] text-xs mt-1">{error.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'La contraseña es obligatoria', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-4">
            <TextInput
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#1A1A1A]"
              placeholder="Contraseña"
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
            {error && <Text className="text-[#E31837] text-xs mt-1">{error.message}</Text>}
          </View>
        )}
      />

      <Controller
        control={control}
        name="confirm"
        rules={{
          required: 'Confirma tu contraseña',
          validate: (value) =>
            value === getValues('password') || 'Las contraseñas no coinciden',
        }}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <View className="mb-6">
            <TextInput
              className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#1A1A1A]"
              placeholder="Confirmar contraseña"
              secureTextEntry
              onChangeText={onChange}
              value={value}
            />
            {error && <Text className="text-[#E31837] text-xs mt-1">{error.message}</Text>}
          </View>
        )}
      />

      <AnimatedButton label="Crear cuenta" onPress={handleSubmit(onSubmit)} />

      <Text
        className="text-center text-[#006491] mt-4 py-2"
        onPress={() => navigation.goBack()}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Text>
    </View>
  );
}
```

---

## MÓDULO 3: Storage y TanStack Query

### Archivo: `src/storage/dishStorage.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/storage/dishStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dish } from '../types';

// El namespace por usuario garantiza aislamiento de datos
const getKey = (userId: string) => `dishes:${userId}`;

export async function loadDishes(userId: string): Promise<Dish[]> {
  const raw = await AsyncStorage.getItem(getKey(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function saveDishes(userId: string, dishes: Dish[]): Promise<void> {
  await AsyncStorage.setItem(getKey(userId), JSON.stringify(dishes));
}

export async function addDish(userId: string, dish: Dish): Promise<Dish[]> {
  const current = await loadDishes(userId);
  const updated = [dish, ...current]; // el plato nuevo va al inicio
  await saveDishes(userId, updated);
  return updated;
}

export async function deleteDish(userId: string, dishId: string): Promise<Dish[]> {
  const current = await loadDishes(userId);
  const updated = current.filter((d) => d.id !== dishId);
  await saveDishes(userId, updated);
  return updated;
}
```

### Archivo: `src/hooks/useDishes.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/hooks/useDishes.ts
// TanStack Query gestiona el caché de platos:
// - useQuery: cachea la lista, evita releer AsyncStorage en cada render
// - useMutation: actualiza el caché inmediatamente sin refetch (UI optimista)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dish } from '../types';
import { loadDishes, addDish, deleteDish } from '../storage/dishStorage';

export function useDishes(userId: string) {
  const qc = useQueryClient();
  const queryKey = ['dishes', userId];

  const { data: dishes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => loadDishes(userId),
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: (dish: Dish) => addDish(userId, dish),
    onSuccess: (updatedDishes) => qc.setQueryData(queryKey, updatedDishes),
  });

  const deleteMutation = useMutation({
    mutationFn: (dishId: string) => deleteDish(userId, dishId),
    onSuccess: (updatedDishes) => qc.setQueryData(queryKey, updatedDishes),
  });

  return {
    dishes,
    isLoading,
    addDish: addMutation.mutate,
    deleteDish: deleteMutation.mutate,
  };
}
```

---

## MÓDULO 4: GPS

### Archivo: `src/hooks/useLocation.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/hooks/useLocation.ts
import * as Location from 'expo-location';

export async function captureLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permiso de ubicación denegado');
  }

  const loc = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });

  const [geo] = await Location.reverseGeocodeAsync(loc.coords);

  return {
    latitude: loc.coords.latitude,
    longitude: loc.coords.longitude,
    city: geo.city ?? null,
    country: geo.country ?? null,
  };
}
```

---

## MÓDULO 5: Componentes con animaciones

### Archivo: `src/components/AnimatedButton.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/components/AnimatedButton.tsx
// Animación 3: withSpring en el botón al presionar
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable, Text } from 'react-native';

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
```

### Archivo: `src/components/DishCard.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/components/DishCard.tsx
// Animación 2: FadeOutLeft al eliminar con swipe
import Animated, {
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, Text, Image } from 'react-native';
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
```

### Archivo: `src/components/DishList.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/components/DishList.tsx
// Animación 1: FadeInDown al agregar un plato nuevo
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FlatList, Text, View } from 'react-native';
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
```

---

## MÓDULO 6: Pantallas principales

### Archivo: `src/screens/AddDishScreen.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/screens/AddDishScreen.tsx
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { View, Text, TextInput, Image, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { captureLocation } from '../hooks/useLocation';
import { useDishes } from '../hooks/useDishes';
import { useAuth } from '../hooks/useAuth';
import AnimatedButton from '../components/AnimatedButton';

type FormData = { name: string };

export default function AddDishScreen({ navigation }: any) {
  const { user } = useAuth();
  const { addDish } = useDishes(user!.id);
  const { control, handleSubmit, reset } = useForm<FormData>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (source: 'camera' | 'gallery') => {
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async ({ name }: FormData) => {
    if (!photoUri) {
      Alert.alert('Foto requerida', 'Debes seleccionar o tomar una foto del plato');
      return;
    }
    setLoading(true);
    try {
      // El GPS se captura aquí, en el momento de presionar Registrar
      const location = await captureLocation();
      addDish({
        id: uuidv4(),
        user_id: user!.id,
        name,
        photo_uri: photoUri,
        created_at: new Date().toISOString(),
        ...location,
      });
      reset();
      setPhotoUri(null);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-12 pb-8">
        <Text className="text-2xl font-bold text-[#006491] mb-6">
          Registrar plato
        </Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: 'El nombre del plato es obligatorio' }}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <View className="mb-5">
              <Text className="text-[#1A1A1A] font-medium mb-2">Nombre del plato</Text>
              <TextInput
                className="bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#1A1A1A]"
                placeholder="Ej: Pizza Margherita"
                onChangeText={onChange}
                value={value}
              />
              {error && (
                <Text className="text-[#E31837] text-xs mt-1">{error.message}</Text>
              )}
            </View>
          )}
        />

        <Text className="text-[#1A1A1A] font-medium mb-2">Foto del plato</Text>
        <View className="flex-row gap-3 mb-4">
          <AnimatedButton label="📷 Cámara" onPress={() => pickImage('camera')} />
          <AnimatedButton label="🖼️ Galería" onPress={() => pickImage('gallery')} variant="secondary" />
        </View>

        {photoUri ? (
          <Image
            source={{ uri: photoUri }}
            className="w-full h-52 rounded-xl mb-6"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-52 rounded-xl mb-6 bg-[#F5F5F5] items-center justify-center">
            <Text className="text-[#6B7280]">Sin foto seleccionada</Text>
          </View>
        )}

        <Text className="text-[#6B7280] text-xs mb-6 text-center">
          📍 La ubicación GPS se capturará automáticamente al registrar
        </Text>

        <AnimatedButton
          label={loading ? 'Registrando...' : '✅ Registrar plato'}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScrollView>
  );
}
```

### Archivo: `src/screens/HomeScreen.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/screens/HomeScreen.tsx
import { View, Text, Pressable } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useDishes } from '../hooks/useDishes';
import DishList from '../components/DishList';

export default function HomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { dishes, isLoading, deleteDish } = useDishes(user!.id);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-xl font-bold">🍕 Gastro Map</Text>
          <Text className="text-white text-xs opacity-80">{user?.email}</Text>
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
```

---

## MÓDULO 7: App.tsx (punto de entrada)

### Archivo: `App.tsx`
Reemplaza el contenido de `App.tsx` en la raíz con exactamente esto:
```tsx
// App.tsx
import 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from './src/lib/queryClient';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
```

> Nota para el agente: el import de `react-native-gesture-handler` debe ser el primero en App.tsx, antes que cualquier otro import.

---

## Actualización de RootNavigator para incluir AddDish

Actualiza `src/navigation/RootNavigator.tsx` para agregar la pantalla `AddDish` dentro del stack autenticado:
```tsx
// src/navigation/RootNavigator.tsx (versión actualizada)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddDishScreen from '../screens/AddDishScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AddDish" component={AddDishScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```
