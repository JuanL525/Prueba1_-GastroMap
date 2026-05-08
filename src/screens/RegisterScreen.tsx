// src/screens/RegisterScreen.tsx
import { Controller, useForm } from 'react-hook-form';
import { Alert, Text, TextInput, View } from 'react-native';
import AnimatedButton from '../components/AnimatedButton';
import { supabase } from '../lib/supabase';

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
