# TALLER7_SETUP — Instalación de dependencias

## Paso 1: Instalar dependencias de mapas

Ejecuta en la terminal del proyecto GastroMap:
```bash
npx expo install react-native-maps
npx expo install react-native-webview
```

## Paso 2: Actualizar app.json para react-native-maps

Agrega el plugin de react-native-maps dentro del array `plugins` en `app.json`:
```json
{
  "expo": {
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": ""
        }
      ]
    ]
  }
}
```

> Nota: dejamos googleMapsApiKey vacío porque usaremos OpenStreetMap (gratuito, sin API key).

## Paso 3: Crear carpeta utils

Ejecuta:
```bash
mkdir -p src/utils
```

## Paso 4: Verificar que expo-location ya está instalado

Ejecuta:
```bash
npx expo install expo-location
```
Si ya está instalado, el comando no hace nada. Si no estaba, lo instala.

## Paso 5: Limpiar caché

```bash
npx expo start --clear
```

## Verificación antes de continuar
- [ ] `react-native-maps` aparece en `package.json`
- [ ] `react-native-webview` aparece en `package.json`
- [ ] La carpeta `src/utils/` existe
- [ ] `app.json` tiene el plugin de `react-native-maps`
