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
