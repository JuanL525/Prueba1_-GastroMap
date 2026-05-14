# Taller 7 — GastroMap: Mapa interactivo con Leaflet + OpenStreetMap

## Contexto
Este taller extiende el proyecto GastroMap (Prueba I) agregando mapas interactivos.
Repositorio base: https://github.com/JuanL525/Prueba1_-GastroMap.git

## Qué debes implementar

### Flujo principal (obligatorio)
1. Al registrar un plato → el usuario puede tomar su ubicación actual GPS **o** seleccionar manualmente un punto en el mapa
2. Pantalla de detalle del plato con botón "Ver ubicación"
3. Al presionar el botón → MapView centrado en las coordenadas del plato
4. Marker sobre el punto exacto donde se registró el plato

### Distancia interactiva (puntos extra a la Prueba I — 3 puntos)
Implementar la opción COMPLETA (3 puntos, no la básica de 1.5):
- Obtener la ubicación actual del usuario en tiempo real
- Dibujar una línea en el mapa entre la ubicación del usuario y el marker del plato
- Mostrar el número de kilómetros calculados sobre o debajo del mapa
- La línea debe ser visible y trazada sobre el mapa

## Stack nuevo a agregar (sobre el proyecto existente)
- `react-native-maps` — componente MapView nativo
- `react-native-webview` — necesario para Leaflet en Expo
- `leaflet` — librería de mapas (se usa via WebView con HTML)
- `expo-location` — ya instalado, se reutiliza para ubicación actual

## Archivos que el agente debe crear o modificar

### Archivos NUEVOS a crear:
```
src/
├── components/
│   ├── MapSelector.tsx        ← mapa para seleccionar punto al registrar
│   └── DishMapView.tsx        ← mapa de detalle con marker + línea de distancia
├── screens/
│   └── DishDetailScreen.tsx   ← pantalla de detalle del plato
└── utils/
    └── distance.ts            ← función para calcular distancia entre coordenadas
```

### Archivos EXISTENTES a modificar:
```
src/screens/AddDishScreen.tsx  ← agregar opción de selección manual en mapa
src/screens/HomeScreen.tsx     ← agregar navegación al detalle del plato
src/navigation/RootNavigator.tsx ← agregar ruta DishDetail
app/(tabs)/dish-detail.tsx     ← nueva ruta de Expo Router
```

## Documentos de implementación
Lee en orden:
1. `docs/TALLER7_SETUP.md` — dependencias e instalación
2. `docs/TALLER7_MODULES.md` — código de cada módulo
3. `docs/TALLER7_RUBRICA.md` — criterios y checklist de entrega
