import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';
import { storage } from '@/utils/storage';
import { AppScreen } from '@/components/AppScreen';

const PROFILE_PICTURE_KEY = 'profile_picture';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { stats } = useCourses();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const displayName =
    user?.username ||
    (user?.email ? user.email.split('@')[0] : '') ||
    'Learner';

  useEffect(() => {
    const loadPicture = async () => {
      const savedPicture = await storage.getString(PROFILE_PICTURE_KEY);
      if (savedPicture) {
        setAvatarUrl(savedPicture);
      }
    };

    void loadPicture();
  }, []);

  const handleSavePicture = async () => {
    const value = avatarUrl.trim();

    if (!value) {
      Alert.alert('Invalid image', 'Please enter an image URL.');
      return;
    }

    Keyboard.dismiss();
    await storage.setString(PROFILE_PICTURE_KEY, value);
    Alert.alert('Saved', 'Profile picture updated.');
  };

  return (
    <AppScreen contentContainerStyle={styles.container} scroll>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.headerCard}>
        <Image
          source={{
            uri:
              avatarUrl ||
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.enrolledCount}</Text>
          <Text style={styles.statLabel}>Enrolled</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.bookmarkCount}</Text>
          <Text style={styles.statLabel}>Bookmarks</Text>
        </View>
        <View style={styles.statTile}>
          <Text style={styles.statValue}>{stats.progressPercent}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Profile Picture</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setAvatarUrl}
          placeholder="Paste profile image URL"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          value={avatarUrl}
        />

        <TouchableOpacity onPress={handleSavePicture} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Update Profile Picture</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.item}>Username: {displayName}</Text>
        <Text style={styles.item}>Email: {user?.email || 'No email available'}</Text>
        <Text style={styles.item}>Role: {user?.role || 'Learner'}</Text>
      </View>

      <TouchableOpacity onPress={logout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    color: '#0f172a',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  avatar: {
    backgroundColor: '#dbe4f0',
    borderRadius: 48,
    height: 96,
    width: 96,
  },
  name: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  email: {
    color: '#475569',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  statTile: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  statValue: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    color: '#475569',
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  sectionTitle: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderColor: '#dbe4f0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#e0e7ff',
    borderRadius: 12,
    marginBottom: 14,
    padding: 12,
  },
  secondaryButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  item: {
    color: '#334155',
    fontSize: 15,
    marginBottom: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 12,
    marginTop: 16,
    padding: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
