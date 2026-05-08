# RÚBRICA — Verificación final antes de entregar

Usa este archivo al final para verificar que el proyecto cumple todos los criterios.
Para cada ítem, revisa el código y confirma con ✅ o indica qué falta.

---

## 1. Autenticación con Supabase — 35 pts

### Criterio: El usuario puede registrarse con email y contraseña (18 pts)
Verifica que:
- [ ] `RegisterScreen.tsx` existe y tiene campos `email`, `password` y `confirm`
- [ ] La validación `password === confirm` ocurre **antes** de llamar a `supabase.auth.signUp`
- [ ] Si las contraseñas no coinciden, muestra `Alert` con mensaje de error
- [ ] El campo `confirm` usa `validate` en React Hook Form para comparar con `password`
- [ ] `supabase.auth.signUp({ email, password })` se llama correctamente
- [ ] Los errores de Supabase se muestran al usuario con `Alert.alert`

### Criterio: El usuario puede iniciar y cerrar sesión (15 pts)
Verifica que:
- [ ] `LoginScreen.tsx` tiene campos `email` y `password` con React Hook Form
- [ ] `supabase.auth.signInWithPassword({ email, password })` se llama en el submit
- [ ] El botón "Salir" en `HomeScreen.tsx` llama a `signOut()` del hook `useAuth`
- [ ] `signOut` llama a `supabase.auth.signOut()`

### Criterio: Redirige automáticamente según el estado de sesión (2 pts)
Verifica que:
- [ ] `RootNavigator.tsx` usa `useAuth` para leer `session`
- [ ] Si `session` existe → muestra `HomeScreen`
- [ ] Si `session` es null → muestra `LoginScreen`
- [ ] `useAuth` usa `supabase.auth.onAuthStateChange` para detectar cambios en tiempo real

---

## 2. Registro y almacenamiento de platos — 35 pts

### Criterio: Se puede agregar un plato con nombre, foto y GPS (15 pts)
Verifica que:
- [ ] `AddDishScreen.tsx` tiene campo de nombre con React Hook Form
- [ ] Hay dos botones: uno para cámara (`launchCameraAsync`) y otro para galería (`launchImageLibraryAsync`)
- [ ] La foto seleccionada se previsualiza en pantalla
- [ ] `captureLocation()` se llama dentro del `onSubmit`, NO antes (GPS al momento de registrar)
- [ ] Si no hay foto, se muestra error antes de intentar registrar
- [ ] El objeto `Dish` creado incluye todos los campos del tipo: `id`, `user_id`, `name`, `photo_uri`, `city`, `country`, `latitude`, `longitude`, `created_at`
- [ ] El `id` se genera con `uuidv4()`

### Criterio: Los platos se guardan en AsyncStorage (10 pts)
Verifica que:
- [ ] `dishStorage.ts` existe con funciones `loadDishes`, `saveDishes`, `addDish`, `deleteDish`
- [ ] La clave de AsyncStorage es `dishes:{user_id}` (namespace por usuario)
- [ ] `addDish` coloca el nuevo plato al inicio del array: `[dish, ...current]`
- [ ] `useDishes.ts` usa TanStack Query (`useQuery` y `useMutation`)

### Criterio: Los platos persisten al cerrar y reabrir la app (5 pts)
Verifica que:
- [ ] `useQuery` en `useDishes` llama a `loadDishes(userId)` como `queryFn`
- [ ] `enabled: !!userId` está presente para no ejecutar con userId vacío
- [ ] Al reabrir la app y hacer login, los platos del usuario aparecen cargados

### Criterio: El formulario se limpia y tiene controles con React Hook Form (5 pts)
Verifica que:
- [ ] `reset()` se llama después de registrar exitosamente el plato
- [ ] `setPhotoUri(null)` se llama después de registrar para limpiar la foto
- [ ] Todos los campos de `AddDishScreen` usan `Controller` de React Hook Form
- [ ] Hay `rules: { required: ... }` en cada campo del formulario

---

## 3. Componentes, animaciones y estilos — 20 pts

### Criterio: Interfaz vistosa, intuitiva y amigable (10 pts)
Verifica que:
- [ ] Se usa la paleta de Domino's en toda la UI: azul `#006491`, rojo `#E31837`
- [ ] El header de `HomeScreen` usa fondo `#006491`
- [ ] Los botones destructivos o de acento usan `#E31837`
- [ ] Las cards de platos muestran foto, nombre, ciudad y fecha
- [ ] Hay estado vacío cuando no hay platos registrados

### Criterio: Solo estilos Uniwind, sin StyleSheet (5 pts)
Verifica que:
- [ ] Ningún archivo importa `StyleSheet` de `react-native`
- [ ] Ningún archivo usa `StyleSheet.create(...)`
- [ ] Todos los estilos usan `className="..."` de Uniwind
- [ ] La excepción permitida es `style={{ flex: 1 }}` en `GestureHandlerRootView` (no es un StyleSheet)

### Criterio: Mínimo 3 animaciones de React Native Reanimated (5 pts)
Verifica que estén implementadas estas 3 animaciones:
- [ ] **Animación 1 — Entrada de card**: `DishList.tsx` usa `entering={FadeInDown.delay(index * 60).springify()}` en el `Animated.View` que envuelve cada `DishCard`
- [ ] **Animación 2 — Salida de card**: `DishCard.tsx` tiene `exiting={FadeOutLeft}` en el `Animated.View` raíz del componente
- [ ] **Animación 3 — Escala de botón**: `AnimatedButton.tsx` usa `useSharedValue`, `useAnimatedStyle` y `withSpring` para escalar el botón al presionar

---

## 4. APK funcional — 10 pts

Verifica que:
- [ ] `eas.json` existe con perfil `preview` configurado para generar APK (no AAB)
- [ ] `eas build --platform android --profile preview` ejecuta sin errores
- [ ] El APK generado instala y corre en dispositivo o emulador
- [ ] Todas las funciones son demostrables en el APK: registro, login, agregar plato, swipe, logout

Contenido mínimo de `eas.json`:
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

---

## Adicionales

### TanStack Query — 10 pts extra
Verifica que:
- [ ] `QueryClientProvider` envuelve toda la app en `App.tsx`
- [ ] `useDishes.ts` usa `useQuery` con `queryKey: ['dishes', userId]`
- [ ] `useDishes.ts` usa `useMutation` para agregar, con `onSuccess` que llama `qc.setQueryData`
- [ ] `useDishes.ts` usa `useMutation` para eliminar, con `onSuccess` que llama `qc.setQueryData`

Prepárate para explicar en la presentación:
- ¿Qué es `queryKey` y para qué sirve? → Identifica y cachea los datos; si el key cambia, hace un nuevo fetch
- ¿Qué hace `qc.setQueryData`? → Actualiza el caché manualmente sin hacer otro fetch
- ¿Qué ventaja tiene sobre `useState`? → Caché compartido, sin peticiones duplicadas, sincronización automática

### Paleta Domino's — 5 pts extra
Verifica que:
- [ ] El color azul `#006491` se usa en headers, títulos y botones primarios
- [ ] El color rojo `#E31837` se usa en acciones de acento, eliminar y FAB
- [ ] No se usan colores genéricos de Taiwind como `blue-500` o `red-500`

---

## Penalizaciones — verifica antes de hacer push

### -10 pts: Credenciales expuestas
Ejecuta esto y confirma que devuelve vacío:
```bash
grep -r "supabase.co" src/
grep -r "eyJ" src/
git log --all --full-history -- .env
```
Confirma que:
- [ ] `.env` está en `.gitignore`
- [ ] `.env` NO está commiteado en el repositorio
- [ ] `src/lib/supabase.ts` lee las credenciales de `process.env`, no hardcodeadas

### -30 pts: No poder explicar el código
Prepárate para explicar:
- [ ] ¿Cómo funciona `onAuthStateChange` de Supabase?
- [ ] ¿Por qué el namespace `dishes:{user_id}` en AsyncStorage?
- [ ] ¿Qué hace `runOnJS` en el swipe de `DishCard`?
- [ ] ¿Por qué `GestureHandlerRootView` envuelve toda la app?
- [ ] ¿Qué es `useSharedValue` y por qué no es un `useState`?

---

## Resumen de puntos

| Módulo | Pts base |
|---|---|
| Autenticación Supabase | 35 |
| Registro y almacenamiento | 35 |
| Componentes, animaciones, estilos | 20 |
| APK funcional | 10 |
| **Total base** | **100** |
| TanStack Query (adicional) | +10 |
| Paleta Domino's (adicional) | +5 |
| **Máximo posible** | **115** |
