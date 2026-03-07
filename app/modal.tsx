import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';

export default function ModalScreen() {
  return (
    <AppScreen contentContainerStyle={styles.container} scroll>
      <View style={styles.card}>
        <Text style={styles.text}>Modal</Text>
        <Text style={styles.subtitle}>This screen is now keyboard and scroll safe.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  text: {
    color: '#0f172a',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
  },
});
