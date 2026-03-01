import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const { stats } = useCourses();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome {user?.username || 'Learner'}</Text>
      <Text style={styles.subtitle}>Keep your momentum going.</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Progress</Text>
        <Text style={styles.statsItem}>Enrolled courses: {stats.enrolledCount}</Text>
        <Text style={styles.statsItem}>Bookmarks: {stats.bookmarkCount}</Text>
        <Text style={styles.statsItem}>Progress: {stats.progressPercent}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    flex: 1,
    padding: 16,
  },
  heading: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 10,
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 8,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  statsTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  statsItem: {
    color: '#374151',
    marginTop: 6,
  },
});
