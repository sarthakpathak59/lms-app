import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  normalizeUsername,
  validateEmail,
  validatePassword,
  validateUsername,
} from '@/utils/validation';
import { AppScreen } from '@/components/AppScreen';

export default function RegisterScreen() {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) {
      setError('Username is required.');
      return;
    }

    if (!validateUsername(normalizedUsername)) {
      setError(
        'Username must be 3-30 chars and use only lowercase letters, numbers, or _.'
      );
      return;
    }

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
      const successMessage = await register(
        normalizedUsername,
        email.trim(),
        password
      );
      Alert.alert('Success', successMessage);
      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <View style={styles.container}>
          <View style={styles.accentCircleLarge} />
          <View style={styles.accentCircleSmall} />

          <View style={styles.card}>
            <Text style={styles.eyebrow}>GET STARTED</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the learning platform</Text>

            <Text style={styles.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setUsername}
              placeholder="your_username"
              placeholderTextColor="#94a3b8"
              style={styles.input}
              value={username}
            />

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
              placeholder="Create a strong password"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              style={styles.input}
              value={password}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              disabled={loading}
              onPress={handleRegister}
              style={[styles.button, loading ? styles.buttonDisabled : null]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.link}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: {
    flex: 1,
  },
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
    left: -24,
    opacity: 0.35,
    position: 'absolute',
    top: 54,
    width: 160,
  },
  accentCircleSmall: {
    backgroundColor: '#93c5fd',
    borderRadius: 54,
    height: 108,
    opacity: 0.35,
    position: 'absolute',
    right: -26,
    top: 130,
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
    color: '#0f172a',
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
