import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/lib/auth';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerTitleAlign: 'center' }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
