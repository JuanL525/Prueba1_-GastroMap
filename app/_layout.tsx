// app/_layout.tsx
import 'react-native-get-random-values';
import '../global.css';
import 'react-native-gesture-handler';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { queryClient } from '../src/lib/queryClient';
import RootNavigator from '../src/navigation/RootNavigator';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}