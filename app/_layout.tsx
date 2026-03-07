import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { CourseProvider } from '@/context/CourseContext';
import { useAppBootstrap } from '@/hooks/useAppBootstrap';
import { StatusBar } from 'expo-status-bar';

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
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="course/[id]"
          options={{ presentation: 'card', headerShown: false }}
        />
        <Stack.Screen
          name="webview/[id]"
          options={{ presentation: 'modal', headerShown: false }}
        />
        <Stack.Screen name="no-internet" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

function AppShell() {
  useAppBootstrap();

  return (
    <>
      <StatusBar
        backgroundColor="#f3f6fb"
        style="dark"
        translucent={false}
      />
      <CourseProvider>
        <RootNavigator />
      </CourseProvider>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
