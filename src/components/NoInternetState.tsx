import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppScreen } from './AppScreen';

interface NoInternetStateProps {
  hasCachedData: boolean;
  cachedCount: number;
  onRetry: () => void;
}

export const NoInternetState = ({
  hasCachedData,
  cachedCount,
  onRetry,
}: NoInternetStateProps) => {
  return (
    <AppScreen contentContainerStyle={styles.container} scroll>
      <Text style={styles.eyebrow}>OFFLINE MODE</Text>
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.message}>
        {hasCachedData
          ? "You're offline. Showing your previously loaded courses."
          : 'Please check your internet connection and try again.'}
      </Text>

      {hasCachedData ? (
        <View style={styles.cachedInfo}>
          <Text style={styles.cachedText}>{cachedCount} cached courses available</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: '#d97706',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 16,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  cachedInfo: {
    backgroundColor: '#e0f2fe',
    borderRadius: 14,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cachedText: {
    color: '#0f766e',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
