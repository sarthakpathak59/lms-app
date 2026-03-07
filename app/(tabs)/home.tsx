import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';
import { AppScreen } from '@/components/AppScreen';

export default function HomeScreen() {
  const { user } = useAuth();
  const { stats } = useCourses();
  const progressWidth = `${Math.min(Math.max(stats.progressPercent, 0), 100)}%`;

  return (
    <AppScreen contentContainerStyle={styles.container} scroll>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>DAILY LEARNING</Text>
        <Text style={styles.heading}>Welcome {user?.username || 'Learner'}</Text>
        <Text style={styles.subtitle}>Keep your momentum going.</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.progressText}>{stats.progressPercent}% overall progress</Text>
      </View>

      <View style={styles.gridRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.enrolledCount}</Text>
          <Text style={styles.metricLabel}>Enrolled</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricValue}>{stats.bookmarkCount}</Text>
          <Text style={styles.metricLabel}>Bookmarked</Text>
        </View>
      </View>

      <View style={styles.quickActionsCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/courses')}
          style={styles.actionButtonPrimary}
        >
          <Text style={styles.actionButtonPrimaryText}>Explore Courses</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          style={styles.actionButtonSecondary}
        >
          <Text style={styles.actionButtonSecondaryText}>Open Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.sectionTitle}>Learning Tip</Text>
        <Text style={styles.tipText}>
          Bookmark 3-5 courses first, then enroll in one focused track to improve completion.
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  eyebrow: {
    color: '#1d4ed8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  heading: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    marginTop: 6,
  },
  progressTrack: {
    backgroundColor: '#e2e8f0',
    borderRadius: 99,
    height: 10,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1d4ed8',
    height: '100%',
  },
  progressText: {
    color: '#334155',
    fontSize: 13,
    marginTop: 8,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 16,
  },
  metricValue: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '700',
  },
  metricLabel: {
    color: '#334155',
    marginTop: 6,
  },
  quickActionsCard: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  actionButtonPrimary: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    padding: 13,
  },
  actionButtonPrimaryText: {
    color: '#fff',
    fontWeight: '600',
  },
  actionButtonSecondary: {
    alignItems: 'center',
    borderColor: '#1d4ed8',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    padding: 13,
  },
  actionButtonSecondaryText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 16,
  },
  tipText: {
    color: '#334155',
    lineHeight: 21,
  },
});
