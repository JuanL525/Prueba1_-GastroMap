// src/screens/AddDishScreen.tsx
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import AnimatedButton from '../components/AnimatedButton';
import MapSelector from '../components/MapSelector';
import { useAuth } from '../hooks/useAuth';
import { useDishes } from '../hooks/useDishes';
import { captureLocation } from '../hooks/useLocation';

type FormData = { name: string };

export default function AddDishScreen({ navigation }: any) {
  // 1. Extraemos loading de useAuth
  const { user, loading: authLoading } = useAuth();
  
  // 2. Usamos el fallback seguro con ?? ''
  const { addDish } = useDishes(user?.id ?? '');
  
  const { control, handleSubmit, reset } = useForm<FormData>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualLocation, setManualLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);

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
    if (!user) return; // Protección extra
    
    if (!photoUri) {
      Alert.alert('Foto requerida', 'Debes seleccionar o tomar una foto del plato');
      return;
    }
    setLoading(true);
    try {
      const location = manualLocation
        ? {
            latitude: manualLocation.latitude,
            longitude: manualLocation.longitude,
            city: null,
            country: null,
          }
        : await captureLocation();

      addDish({
        id: uuidv4(),
        user_id: user.id, // Ya podemos usar user.id seguro
        name,
        photo_uri: photoUri,
        created_at: new Date().toISOString(),
        ...location,
      });
      reset();
      setPhotoUri(null);
      setManualLocation(null);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Pantalla de carga mientras se verifica el usuario
  if (authLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#006491" />
      </View>
    );
  }

  // 4. Si no hay usuario, retornamos null
  if (!user) return null;

  return (
    <>
      <ScrollView className="flex-1 bg-white">
        <View className="px-6 pt-12 pb-8">
        <Text className="text-2xl font-bold text-[#006491] mb-6">
          Registrar plato
        </Text>

        <Controller
          control={control}
          name="name"
          rules={{
            required: 'El nombre del plato es obligatorio',
            pattern: {
              value: /^[^0-9]+$/,
              message: 'El nombre del plato no puede contener números',
            },
          }}
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
          <AnimatedButton label="📷 Cámara" onPress={() => pickImage('camera')} flex />
          <AnimatedButton label="🖼️ Galería" onPress={() => pickImage('gallery')} variant="secondary" flex />
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

        <View className="mb-4">
          <Text className="text-[#1A1A1A] font-medium mb-2">Ubicación manual</Text>
          <Pressable
            onPress={() => setIsMapSelectorOpen(true)}
            className="bg-[#006491] px-4 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">Seleccionar ubicación en el mapa</Text>
          </Pressable>
          {manualLocation ? (
            <Text className="text-[#6B7280] text-sm mt-3">
              Ubicación seleccionada: {manualLocation.latitude.toFixed(6)}, {manualLocation.longitude.toFixed(6)}
            </Text>
          ) : (
            <Text className="text-[#6B7280] text-sm mt-3">
              Si no seleccionas una ubicación, se usará GPS automáticamente.
            </Text>
          )}
        </View>

        <AnimatedButton
          label={loading ? 'Registrando...' : '✅ Registrar plato'}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </ScrollView>

    <Modal visible={isMapSelectorOpen} animationType="slide">
      <MapSelector
        onClose={() => setIsMapSelectorOpen(false)}
        onLocationSelect={(lat, lng) => {
          setManualLocation({ latitude: lat, longitude: lng });
          setIsMapSelectorOpen(false);
        }}
      />
    </Modal>
  </>
  );
}