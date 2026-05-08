# SETUP — Configuración inicial del proyecto



## Paso 2: Instalar dependencias

Ejecuta exactamente estos comandos en orden:
```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install expo-camera expo-image-picker expo-location
npm install react-hook-form
npm install @tanstack/react-query
npm install uniwind
npm install react-native-get-random-values uuid
npm install --save-dev @types/uuid
```

## Paso 3: Crear archivo `babel.config.js`

Reemplaza el contenido del archivo con exactamente esto:
```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // debe ir al final
  };
};
```

## Paso 4: Crear archivo `.gitignore`

Crea `.gitignore` en la raíz con este contenido:
```
node_modules/
.expo/
dist/
.env
.env.local
*.jks
*.p8
*.p12
*.key
*.mobileprovision
```

## Paso 5: Crear archivo `.env.example`

Crea `.env.example` en la raíz con este contenido:
```
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## Paso 6: Crear archivo `.env`

Crea `.env` en la raíz (el usuario llenará sus propias credenciales):
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Paso 7: Actualizar `app.json`

Agrega el campo `plugins` dentro de `expo` en `app.json`:
```json
{
  "expo": {
    "name": "Gastro Map",
    "slug": "gastro-map",
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Gastro Map necesita acceso a tu cámara para fotografiar tus platos."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Gastro Map necesita acceso a tu galería para seleccionar fotos."
        }
      ],
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Gastro Map necesita tu ubicación para registrar dónde comiste."
        }
      ]
    ]
  }
}
```

## Paso 8: Crear `src/types/index.ts`

Crea el archivo `src/types/index.ts` con exactamente este contenido:
```ts
// src/types/index.ts

export type Dish = {
  id: string;
  user_id: string;
  name: string;
  photo_uri: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

export type AuthUser = {
  id: string;
  email: string;
};
```

## Verificación de setup completo

Antes de continuar al siguiente documento, confirma:
- [ ] `node_modules/` existe y tiene contenido
- [ ] `babel.config.js` tiene el plugin de Reanimated al final
- [ ] `.gitignore` incluye `.env`
- [ ] `.env` existe pero NO tiene credenciales hardcodeadas
- [ ] `src/types/index.ts` tiene el tipo `Dish` con todos sus campos
