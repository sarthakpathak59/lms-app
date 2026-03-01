import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CourseContext';
import { storage } from '@/utils/storage';

const PROFILE_PICTURE_KEY = 'profile_picture';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { stats } = useCourses();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

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

    await storage.setString(PROFILE_PICTURE_KEY, value);
    Alert.alert('Saved', 'Profile picture updated.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <Image
        source={{
          uri:
            avatarUrl ||
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        }}
        style={styles.avatar}
      />

      <TextInput
        autoCapitalize="none"
        onChangeText={setAvatarUrl}
        placeholder="Paste profile image URL"
        style={styles.input}
        value={avatarUrl}
      />

      <TouchableOpacity onPress={handleSavePicture} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Update Profile Picture</Text>
      </TouchableOpacity>

      <Text style={styles.item}>Username: {user?.username || 'N/A'}</Text>
      <Text style={styles.item}>Email: {user?.email || 'N/A'}</Text>
      <Text style={styles.item}>Role: {user?.role || 'N/A'}</Text>

      <View style={styles.statsBox}>
        <Text style={styles.statsTitle}>Statistics</Text>
        <Text style={styles.item}>Courses enrolled: {stats.enrolledCount}</Text>
        <Text style={styles.item}>Bookmarks: {stats.bookmarkCount}</Text>
        <Text style={styles.item}>Overall progress: {stats.progressPercent}%</Text>
      </View>

      <TouchableOpacity onPress={logout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    flex: 1,
    padding: 16,
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
  },
  avatar: {
    alignSelf: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 50,
    height: 100,
    marginBottom: 14,
    width: 100,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    marginBottom: 14,
    padding: 10,
  },
  secondaryButtonText: {
    color: '#1e40af',
    fontWeight: '600',
  },
  item: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 8,
  },
  statsBox: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    padding: 12,
  },
  statsTitle: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    marginTop: 16,
    padding: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
