// src/components/DishMapView.tsx
// Mapa de detalle: muestra el marker del plato, la ubicación actual del usuario,
// una línea entre ambos puntos y el número de km de distancia.
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
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
      setDistance(calculateDistance(userLat, userLng, dishLat, dishLng));
      setLoading(false);

      if (mapReady) {
        injectMapData(userLat, userLng);
      }
    })();
  }, [dishLat, dishLng, mapReady]);

  const injectMapData = (userLat: number, userLng: number) => {
    const js = `
      if (window.map) {
        const dishLat = ${dishLat};
        const dishLng = ${dishLng};
        const userLat = ${userLat};
        const userLng = ${userLng};
        const dishName = ${JSON.stringify(dishName)};
        const dishMarker = L.marker([dishLat, dishLng]).addTo(window.map).bindPopup(dishName);
        const userMarker = L.marker([userLat, userLng], { opacity: 0.8 }).addTo(window.map).bindPopup('Tu ubicación');
        const line = L.polyline([[dishLat, dishLng], [userLat, userLng]], { color: '#E31837', weight: 4 }).addTo(window.map);
        window.map.fitBounds([[dishLat, dishLng], [userLat, userLng]], { padding: [40, 40] });
      }
      true;
    `;

    webViewRef.current?.injectJavaScript(js);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
        if (userLocation) {
          injectMapData(userLocation.lat, userLocation.lng);
        }
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

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
    window.map = L.map('map').setView([${dishLat}, ${dishLng}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(window.map);
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
  </script>
</body>
</html>
  `;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#006491" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="h-96 bg-slate-200">
        <WebView
          ref={webViewRef}
          source={{ html: leafletHTML }}
          style={{ flex: 1 }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      </View>
      <View className="px-6 py-4">
        <Text className="text-lg font-bold text-[#1A1A1A] mb-2">{dishName}</Text>
        {distance !== null ? (
          <Text className="text-[#006491] text-base">
            Distancia actual: {distance.toFixed(2)} km
          </Text>
        ) : (
          <Text className="text-[#6B7280]">No se pudo obtener la ubicación actual.</Text>
        )}
      </View>
    </View>
  );
}
