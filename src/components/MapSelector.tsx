// src/components/MapSelector.tsx
// Permite al usuario seleccionar manualmente un punto en el mapa
// Se usa en AddDishScreen como alternativa al GPS automático
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  onClose: () => void;
}

export default function MapSelector({
  initialLat = -0.2201641,
  initialLng = -78.5123274,
  onLocationSelect,
  onClose,
}: Props) {
  const webViewRef = useRef<WebView>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

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
        setSelectedLocation({ latitude: data.lat, longitude: data.lng });
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.latitude, selectedLocation.longitude);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-[#006491] pt-12 pb-4 px-6 flex-row items-center justify-between">
        <Text className="text-white text-lg font-bold">Seleccionar ubicación</Text>
        <Pressable onPress={onClose} className="bg-white/20 px-3 py-2 rounded-lg">
          <Text className="text-white text-sm">Cerrar</Text>
        </Pressable>
      </View>

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
        {selectedLocation ? (
          <Text className="text-[#1A1A1A] text-sm text-center mt-3">
            Ubicación seleccionada: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        ) : null}
        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={handleConfirm}
            disabled={!selectedLocation}
            className={`flex-1 rounded-xl py-3 items-center ${selectedLocation ? 'bg-[#006491]' : 'bg-[#94a3b8]'}`}
          >
            <Text className="text-white font-semibold">Confirmar ubicación</Text>
          </Pressable>
          <Pressable
            onPress={onClose}
            className="flex-1 bg-white border border-[#D1D5DB] rounded-xl py-3 items-center"
          >
            <Text className="text-[#1A1A1A] font-semibold">Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
