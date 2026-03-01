import { StyleSheet, Text, View } from 'react-native';

export const OfflineBanner = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Offline mode: showing last available data.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  text: {
    color: '#92400e',
    fontWeight: '500',
  },
});
