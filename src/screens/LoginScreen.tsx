// src/screens/LoginScreen.tsx
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { supabase } from '../lib/supabase';

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
