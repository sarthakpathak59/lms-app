import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { validateEmail, validatePassword } from '@/utils/validation';
import { AppScreen } from '@/components/AppScreen';

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const successMessage = await login(email.trim(), password);
      Alert.alert('Success', successMessage);
      router.replace('/(tabs)/home');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen contentContainerStyle={styles.container} scroll>
      <View style={styles.accentCircleLarge} />
      <View style={styles.accentCircleSmall} />

      <View style={styles.card}>
        <Text style={styles.eyebrow}>LMS APP</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Login to continue learning</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          disabled={loading}
          onPress={handleLogin}
          style={[styles.button, loading ? styles.buttonDisabled : null]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Don&apos;t have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
  },
  accentCircleLarge: {
    backgroundColor: '#bfdbfe',
    borderRadius: 80,
    height: 160,
    opacity: 0.35,
    position: 'absolute',
    right: -24,
    top: 44,
    width: 160,
  },
  accentCircleSmall: {
    backgroundColor: '#93c5fd',
    borderRadius: 54,
    height: 108,
    left: -26,
    opacity: 0.35,
    position: 'absolute',
    top: 120,
    width: 108,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 460,
    padding: 22,
    width: '100%',
  },
  eyebrow: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    marginBottom: 20,
    marginTop: 6,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#dbe4f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  error: {
    color: '#b91c1c',
    marginBottom: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 4,
    padding: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  link: {
    color: '#1d4ed8',
    fontWeight: '600',
    textAlign: 'center',
  },
});
