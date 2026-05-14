# TALLER7_RUBRICA — Criterios de entrega y checklist final

## Requisitos obligatorios (nota de taller + participación)

### 1. Flujo completo de registro con mapa
- [ ] En `AddDishScreen` existe opción "GPS automático" que usa `captureLocation()`
- [ ] En `AddDishScreen` existe opción "Elegir en mapa" que abre `MapSelector`
- [ ] `MapSelector` muestra un mapa Leaflet en WebView con OpenStreetMap
- [ ] Al tocar el mapa en `MapSelector`, se coloca un marker en ese punto
- [ ] Las coordenadas del punto seleccionado se guardan en el objeto `Dish`
- [ ] Si se selecciona ubicación manual, se hace geocodificación inversa para obtener ciudad/país

### 2. Pantalla de detalle del plato
- [ ] Al presionar una card en `HomeScreen`, navega a `DishDetailScreen`
- [ ] `DishDetailScreen` muestra: foto, nombre, ciudad/país, coordenadas, fecha
- [ ] `DishDetailScreen` tiene botón "Ver ubicación" visible solo si hay coordenadas
- [ ] El botón "← Volver" regresa a `HomeScreen`

### 3. MapView con Leaflet + OpenStreetMap
- [ ] Al presionar "Ver ubicación" se muestra el mapa en `DishMapView`
- [ ] El mapa usa Leaflet cargado en `WebView` con tiles de OpenStreetMap
- [ ] Hay un marker ROJO en las coordenadas exactas del plato
- [ ] El mapa se centra automáticamente en el marker del plato

---

## Requisito de puntos extra a la Prueba I (3 puntos — implementación completa)

### Distancia con línea dibujada en el mapa
- [ ] Al abrir `DishMapView`, se solicita la ubicación actual del usuario con `expo-location`
- [ ] Mientras obtiene el GPS, muestra un overlay de carga "Obteniendo tu ubicación..."
- [ ] Hay un marker AZUL en la ubicación actual del usuario
- [ ] Se dibuja una línea punteada azul (`L.polyline`) entre el usuario y el plato
- [ ] El mapa ajusta el zoom con `fitBounds` para mostrar ambos puntos
- [ ] Se muestra el número exacto de km (o metros si < 1km) en el banner superior
- [ ] La distancia se calcula con la fórmula de Haversine en `src/utils/distance.ts`
- [ ] La leyenda inferior identifica el punto rojo (plato) y el punto azul (usuario)

---

## Verificación técnica

### WebView y Leaflet
- [ ] `react-native-webview` está en `package.json`
- [ ] `react-native-maps` está en `package.json`
- [ ] Los mapas cargan tiles de `https://{s}.tile.openstreetmap.org` (sin API key)
- [ ] La comunicación WebView ↔ React Native usa `window.ReactNativeWebView.postMessage` y `onMessage`
- [ ] `injectJavaScript` se usa para enviar la ubicación del usuario al mapa después de que carga

### Navegación
- [ ] Al presionar una DishCard → abre DishDetailScreen (sin errores de navegación)
- [ ] Al presionar "Ver ubicación" → muestra el mapa (reemplaza la pantalla de detalle)
- [ ] Al presionar "← Volver" en el mapa → regresa al detalle
- [ ] Al presionar "← Volver" en el detalle → regresa al Home con la lista

### Estilo
- [ ] Todos los estilos usan `className` de NativeWind (sin StyleSheet)
- [ ] Paleta Domino's mantenida: azul `#006491`, rojo `#E31837`
- [ ] Los markers usan los colores de la paleta: rojo para plato, azul para usuario

---

## Entregables

- [ ] Código subido al repositorio: https://github.com/JuanL525/Prueba1_-GastroMap.git
- [ ] APK generado con `eas build --platform android --profile preview`
- [ ] APK instalado y funcionando en emulador o celular físico
- [ ] Demo en clase mostrando: registro con selección en mapa → detalle → mapa con línea de distancia

---

## Flujo de demo para mostrar en clase

1. Abrir la app → Login
2. Presionar `+` para agregar plato
3. Tomar foto con cámara
4. Presionar "Elegir en mapa" → se abre el mapa → tocar un punto (ej: Villaflora)
5. Confirmar que aparece la ubicación seleccionada
6. Presionar "Registrar plato"
7. En HomeScreen, presionar la card del plato recién registrado
8. En DishDetailScreen, presionar "Ver ubicación"
9. Mostrar: marker rojo en Villaflora, marker azul en La Poli, línea entre ambos, distancia en km
