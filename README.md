# Gastro Map — Proyecto React Native + Expo

## Propósito
Aplicación móvil para registrar platos de comida con foto, nombre y ubicación GPS por usuario autenticado.

## Stack (usa exactamente estas librerías, no alternativas)
- React Native + Expo (TypeScript)
- Supabase — autenticación únicamente
- AsyncStorage — persistencia local de platos por usuario
- React Navigation (native-stack)
- React Native Reanimated — animaciones
- React Native Gesture Handler — swipe
- Expo Camera + Expo ImagePicker — foto
- Expo Location — GPS
- React Hook Form — formularios
- TanStack Query — estado asíncrono y caché
- Uniwind — estilos (NUNCA usar StyleSheet)

## Paleta de colores obligatoria (Domino's Pizza)
- Azul principal: `#006491`
- Rojo acento: `#E31837`
- Fondo: `#FFFFFF`
- Superficie/inputs: `#F5F5F5`
- Texto principal: `#1A1A1A`
- Texto secundario: `#6B7280`

## Estructura de archivos que debes crear
```
gastro-map/
├── .env                          ← NUNCA subir al repo
├── .env.example
├── .gitignore
├── app.json
├── babel.config.js
├── App.tsx
├── tsconfig.json
├── src/
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── queryClient.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDishes.ts
│   │   └── useLocation.ts
│   ├── storage/
│   │   └── dishStorage.ts
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   └── AddDishScreen.tsx
│   ├── components/
│   │   ├── DishCard.tsx
│   │   ├── DishList.tsx
│   │   └── AnimatedButton.tsx
│   └── navigation/
│       └── RootNavigator.tsx
```

## Reglas que debes respetar en TODO el código
1. NUNCA usar `StyleSheet.create` ni `StyleSheet` en ningún archivo
2. SIEMPRE usar clases Uniwind via `className="..."`
3. NUNCA exponer credenciales de Supabase fuera de `.env`
4. SIEMPRE tipar con TypeScript, sin `any` innecesarios
5. El namespace de AsyncStorage es siempre `dishes:{user_id}`

## Documentos de implementación
Lee estos archivos en orden al implementar cada módulo:
1. `docs/SETUP.md` — configuración inicial y dependencias
2. `docs/MODULES.md` — lógica y código de cada módulo
3. `docs/RUBRICA.md` — criterios de evaluación y checklist final
