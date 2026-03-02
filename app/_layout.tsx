import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CourseProvider } from '@/context/CourseContext';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';

function RootNavigator() {
  const { userToken, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (userToken) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="course/[id]"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="webview/[id]"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

function AppShell() {
  useAppBootstrap();

  return (
    <CourseProvider>
      <RootNavigator />
    </CourseProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
