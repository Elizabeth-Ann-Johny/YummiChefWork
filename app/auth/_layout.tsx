import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthLayout() {
  useEffect(() => {
    // Redirect to login by default
    router.replace('/auth/login');
  }, []);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}