# TALLER7_MODULES — Implementación módulo por módulo

Implementa en el orden exacto indicado. No pases al siguiente módulo hasta completar el actual.

---

## MÓDULO 1: Utilidad de distancia

### Archivo: `src/utils/distance.ts`
Crea este archivo con exactamente este contenido:
```ts
// src/utils/distance.ts
// Fórmula de Haversine: calcula distancia entre dos coordenadas en km
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}
```

---

## MÓDULO 2: Componente selector de mapa (al registrar un plato)

### Archivo: `src/components/MapSelector.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/components/MapSelector.tsx
// Permite al usuario seleccionar manualmente un punto en el mapa
// Se usa en AddDishScreen como alternativa al GPS automático
import { useRef } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function MapSelector({
  initialLat = -0.2201641,
  initialLng = -78.5123274,
  onLocationSelect,
  onClose,
}: Props) {
  const webViewRef = useRef<WebView>(null);

  // HTML de Leaflet embebido en WebView
  // initialLat/initialLng centran el mapa (default: La Poli, Quito)
  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100vw; height: 100vh; }
    #map { width: 100%; height: 100%; }
    #instructions {
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 13px;
      z-index: 1000;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="instructions">Toca el mapa para seleccionar la ubicación</div>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${initialLat}, ${initialLng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker = null;

    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;

      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng).addTo(map);
      }

      // Enviar coordenadas a React Native
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'LOCATION_SELECTED',
        lat: lat,
        lng: lng
      }));
    });
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_SELECTED') {
        onLocationSelect(data.lat, data.lng);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
        <Text className="text-white text-lg font-bold">Seleccionar ubicación</Text>
        <Pressable onPress={onClose} className="bg-white/20 px-3 py-2 rounded-lg">
          <Text className="text-white text-sm">Cerrar</Text>
        </Pressable>
      </View>

      {/* Mapa Leaflet en WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: leafletHTML }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
      />

      <View className="bg-[#F5F5F5] px-6 py-4">
        <Text className="text-[#6B7280] text-xs text-center">
          Toca cualquier punto del mapa para seleccionar la ubicación del plato
        </Text>
      </View>
    </View>
  );
}
```

---

## MÓDULO 3: Componente MapView de detalle con distancia

### Archivo: `src/components/DishMapView.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/components/DishMapView.tsx
// Mapa de detalle: muestra el marker del plato, la ubicación actual del usuario,
// una línea entre ambos puntos y el número de km de distancia.
import { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { calculateDistance } from '../utils/distance';

interface Props {
  dishLat: number;
  dishLng: number;
  dishName: string;
}

export default function DishMapView({ dishLat, dishLng, dishName }: Props) {
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  // Obtener ubicación actual del usuario
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const userLat = loc.coords.latitude;
      const userLng = loc.coords.longitude;
      setUserLocation({ lat: userLat, lng: userLng });

      // Calcular distancia con Haversine
      const km = calculateDistance(userLat, userLng, dishLat, dishLng);
      setDistance(km);
      setLoading(false);
    })();
  }, []);

  // Enviar ubicación del usuario al mapa cuando ambos estén listos
  useEffect(() => {
    if (mapReady && userLocation) {
      webViewRef.current?.injectJavaScript(`
        drawUserAndLine(${userLocation.lat}, ${userLocation.lng});
        true;
      `);
    }
  }, [mapReady, userLocation]);

  const leafletHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 100vw; height: 100vh; }
    #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Mapa centrado en el plato
    var map = L.map('map').setView([${dishLat}, ${dishLng}], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Marker del plato (rojo)
    var dishIcon = L.divIcon({
      html: '<div style="background:#E31837;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: ''
    });
    L.marker([${dishLat}, ${dishLng}], { icon: dishIcon })
      .addTo(map)
      .bindPopup('<b>${dishName.replace(/'/g, "\\'")}</b><br>Ubicación del plato')
      .openPopup();

    var userMarker = null;
    var distanceLine = null;

    // Esta función se llama desde React Native cuando tenemos la ubicación del usuario
    function drawUserAndLine(userLat, userLng) {
      // Marker del usuario (azul)
      var userIcon = L.divIcon({
        html: '<div style="background:#006491;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4)"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: ''
      });

      if (userMarker) userMarker.remove();
      userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .addTo(map)
        .bindPopup('Tu ubicación actual');

      // Línea entre usuario y plato
      if (distanceLine) distanceLine.remove();
      distanceLine = L.polyline(
        [[userLat, userLng], [${dishLat}, ${dishLng}]],
        { color: '#006491', weight: 3, dashArray: '8, 6', opacity: 0.8 }
      ).addTo(map);

      // Ajustar zoom para ver ambos puntos
      var bounds = L.latLngBounds(
        [userLat, userLng],
        [${dishLat}, ${dishLng}]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Avisar a React Native que el mapa está listo
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  return (
    <View className="flex-1">
      {/* Badge de distancia */}
      {distance !== null && (
        <View className="bg-[#006491] px-6 py-3 flex-row items-center justify-between">
          <Text className="text-white font-medium">📍 Distancia desde tu ubicación</Text>
          <Text className="text-white font-bold text-lg">
            {distance < 1
              ? `${Math.round(distance * 1000)} m`
              : `${distance.toFixed(2)} km`}
          </Text>
        </View>
      )}

      {/* Mapa */}
      <View className="flex-1 relative">
        <WebView
          ref={webViewRef}
          source={{ html: leafletHTML }}
          style={{ flex: 1 }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />

        {/* Overlay de carga mientras obtiene GPS */}
        {loading && (
          <View className="absolute inset-0 bg-black/30 items-center justify-center">
            <View className="bg-white rounded-2xl px-6 py-4 items-center">
              <ActivityIndicator color="#006491" size="large" />
              <Text className="text-[#1A1A1A] mt-2 font-medium">
                Obteniendo tu ubicación...
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Leyenda */}
      <View className="bg-[#F5F5F5] px-6 py-3 flex-row justify-around">
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-[#E31837]" />
          <Text className="text-[#6B7280] text-xs">Ubicación del plato</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="w-3 h-3 rounded-full bg-[#006491]" />
          <Text className="text-[#6B7280] text-xs">Tu ubicación</Text>
        </View>
      </View>
    </View>
  );
}
```

---

## MÓDULO 4: Pantalla de detalle del plato

### Archivo: `src/screens/DishDetailScreen.tsx`
Crea este archivo con exactamente este contenido:
```tsx
// src/screens/DishDetailScreen.tsx
import { useState } from 'react';
import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { Dish } from '../types';
import DishMapView from '../components/DishMapView';

interface Props {
  dish: Dish;
  onBack: () => void;
}

export default function DishDetailScreen({ dish, onBack }: Props) {
  const [showMap, setShowMap] = useState(false);

  if (showMap && dish.latitude && dish.longitude) {
    return (
      <View className="flex-1 bg-white">
        {/* Header del mapa */}
        <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
          <Text className="text-white text-lg font-bold">{dish.name}</Text>
          <Pressable
            onPress={() => setShowMap(false)}
            className="bg-white/20 px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-sm">← Volver</Text>
          </Pressable>
        </View>
        <DishMapView
          dishLat={dish.latitude}
          dishLng={dish.longitude}
          dishName={dish.name}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
        <Text className="text-white text-xl font-bold">Detalle del plato</Text>
        <Pressable onPress={onBack} className="bg-white/20 px-3 py-2 rounded-lg">
          <Text className="text-white text-sm">← Volver</Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Foto */}
        {dish.photo_uri ? (
          <Image
            source={{ uri: dish.photo_uri }}
            className="w-full h-56"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-56 bg-[#F5F5F5] items-center justify-center">
            <Text className="text-[#6B7280]">Sin foto</Text>
          </View>
        )}

        <View className="px-6 pt-6">
          {/* Nombre */}
          <Text className="text-2xl font-bold text-[#1A1A1A] mb-2">{dish.name}</Text>

          {/* Ubicación */}
          <View className="bg-[#F5F5F5] rounded-xl p-4 mb-4">
            <Text className="text-[#6B7280] text-xs font-medium mb-1 uppercase">
              Registrado en
            </Text>
            <Text className="text-[#1A1A1A] font-medium">
              📍 {dish.city ?? 'Ciudad desconocida'}
              {dish.country ? `, ${dish.country}` : ''}
            </Text>
            {dish.latitude && dish.longitude && (
              <Text className="text-[#6B7280] text-xs mt-1">
                {dish.latitude.toFixed(6)}, {dish.longitude.toFixed(6)}
              </Text>
            )}
          </View>

          {/* Fecha */}
          <View className="bg-[#F5F5F5] rounded-xl p-4 mb-6">
            <Text className="text-[#6B7280] text-xs font-medium mb-1 uppercase">
              Fecha de registro
            </Text>
            <Text className="text-[#1A1A1A] font-medium">
              🗓️{' '}
              {new Date(dish.created_at).toLocaleDateString('es-EC', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Botón Ver ubicación */}
          {dish.latitude && dish.longitude ? (
            <Pressable
              className="bg-[#006491] rounded-xl py-4 items-center mb-4"
              onPress={() => setShowMap(true)}
            >
              <Text className="text-white font-bold text-base">🗺️ Ver ubicación</Text>
            </Pressable>
          ) : (
            <View className="bg-[#F5F5F5] rounded-xl py-4 items-center mb-4">
              <Text className="text-[#6B7280]">Sin coordenadas registradas</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
```

---

## MÓDULO 5: Modificar AddDishScreen para permitir selección manual en mapa

Abre `src/screens/AddDishScreen.tsx` y aplica estos cambios:

### 5a — Agrega estos imports al inicio del archivo (después de los imports existentes):
```tsx
import { Modal } from 'react-native';
import MapSelector from '../components/MapSelector';
```

### 5b — Agrega este estado dentro del componente AddDishScreen (junto a los useState existentes):
```tsx
const [showMapSelector, setShowMapSelector] = useState(false);
const [manualLocation, setManualLocation] = useState<{
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
} | null>(null);
```

### 5c — Agrega esta función dentro del componente, antes del return:
```tsx
const handleManualLocationSelect = async (lat: number, lng: number) => {
  // Hacer geocodificación inversa para obtener ciudad/país
  try {
    const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    setManualLocation({
      latitude: lat,
      longitude: lng,
      city: geo.city ?? null,
      country: geo.country ?? null,
    });
  } catch {
    setManualLocation({ latitude: lat, longitude: lng, city: null, country: null });
  }
  setShowMapSelector(false);
};
```

### 5d — Modifica la función onSubmit para usar manualLocation si está disponible:
Reemplaza la línea donde se llama a `captureLocation()` dentro de `onSubmit` con esto:
```tsx
// Usar ubicación manual si fue seleccionada, si no capturar GPS
const location = manualLocation ?? await captureLocation();
```

### 5e — Agrega este bloque de UI después de los botones de Cámara/Galería y antes de la previsualización de la foto:
```tsx
{/* Separador */}
<View className="flex-row items-center mb-4">
  <View className="flex-1 h-px bg-[#F5F5F5]" />
  <Text className="text-[#6B7280] text-xs mx-3">UBICACIÓN</Text>
  <View className="flex-1 h-px bg-[#F5F5F5]" />
</View>

{/* Opciones de ubicación */}
<View className="flex-row gap-3 mb-4">
  <Pressable
    className="flex-1 bg-[#F5F5F5] rounded-xl py-3 items-center"
    onPress={() => {
      setManualLocation(null); // usar GPS automático
    }}
  >
    <Text className={`text-sm font-medium ${!manualLocation ? 'text-[#006491]' : 'text-[#6B7280]'}`}>
      📡 GPS automático
    </Text>
  </Pressable>
  <Pressable
    className="flex-1 bg-[#F5F5F5] rounded-xl py-3 items-center"
    onPress={() => setShowMapSelector(true)}
  >
    <Text className={`text-sm font-medium ${manualLocation ? 'text-[#006491]' : 'text-[#6B7280]'}`}>
      📍 Elegir en mapa
    </Text>
  </Pressable>
</View>

{/* Indicador de ubicación seleccionada manualmente */}
{manualLocation && (
  <View className="bg-[#006491]/10 rounded-xl px-4 py-3 mb-4 flex-row items-center">
    <Text className="text-[#006491] text-sm flex-1">
      ✅ Ubicación seleccionada: {manualLocation.city ?? 'Punto en mapa'}
      {manualLocation.country ? `, ${manualLocation.country}` : ''}
    </Text>
    <Pressable onPress={() => setManualLocation(null)}>
      <Text className="text-[#E31837] text-sm font-bold ml-2">✕</Text>
    </Pressable>
  </View>
)}

{/* Modal del selector de mapa */}
<Modal visible={showMapSelector} animationType="slide">
  <MapSelector
    onLocationSelect={handleManualLocationSelect}
    onClose={() => setShowMapSelector(false)}
  />
</Modal>
```

---

## MÓDULO 6: Modificar HomeScreen para navegar al detalle

Abre `src/screens/HomeScreen.tsx` y aplica estos cambios:

### 6a — Agrega este estado dentro del componente:
```tsx
const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
```

### 6b — Agrega este import al inicio:
```tsx
import { Dish } from '../types';
import DishDetailScreen from './DishDetailScreen';
```

### 6c — Agrega este bloque ANTES del return principal (renderizado condicional):
```tsx
// Si hay un plato seleccionado, mostrar su detalle
if (selectedDish) {
  return (
    <DishDetailScreen
      dish={selectedDish}
      onBack={() => setSelectedDish(null)}
    />
  );
}
```

### 6d — En el componente DishList, agrega la prop onPress para navegar al detalle:
Modifica la llamada a `<DishList>` para agregar `onDishPress`:
```tsx
<DishList
  dishes={dishes}
  onDelete={deleteDish}
  onDishPress={(dish) => setSelectedDish(dish)}
/>
```

---

## MÓDULO 7: Modificar DishList y DishCard para soportar onPress

### En `src/components/DishList.tsx`
Agrega `onDishPress` a la interfaz Props y pásalo a DishCard:
```tsx
interface Props {
  dishes: Dish[];
  onDelete: (id: string) => void;
  onDishPress: (dish: Dish) => void;  // ← agregar
}

// En el renderItem, pasar la prop a DishCard:
<DishCard dish={item} onDelete={onDelete} onPress={() => onDishPress(item)} />
```

### En `src/components/DishCard.tsx`
Agrega `onPress` a la interfaz Props y envuelve el contenido en un Pressable:
```tsx
interface Props {
  dish: Dish;
  onDelete: (id: string) => void;
  onPress: () => void;  // ← agregar
}

// Dentro del Animated.View, agrega un Pressable que envuelva el contenido de la card:
// El swipe sigue funcionando en el Animated.View exterior
// El Pressable va dentro, sobre el contenido visual (foto, nombre, etc.)
// Usa onPress para navegar al detalle
```

Reemplaza el contenido interior del `Animated.View` en DishCard con:
```tsx
<Animated.View
  exiting={FadeOutLeft}
  style={animatedStyle}
  className="bg-white rounded-2xl mb-4 overflow-hidden border border-[#F5F5F5]"
>
  <Pressable onPress={onPress}>
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
      <View className="flex-row justify-between items-center mt-3">
        <Text className="text-[#006491] text-xs font-medium">Ver detalle →</Text>
        <Text className="text-[#E31837] text-xs">← Desliza para eliminar</Text>
      </View>
    </View>
  </Pressable>
</Animated.View>
```
