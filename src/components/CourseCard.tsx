import { memo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  isBookmarked: boolean;
  onPress: () => void;
  onToggleBookmark: () => void;
}

const CourseCardComponent = ({
  course,
  isBookmarked,
  onPress,
  onToggleBookmark,
}: CourseCardProps) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {course.title}
          </Text>

          <TouchableOpacity onPress={onToggleBookmark} hitSlop={10}>
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? '#2563eb' : '#6b7280'}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        <View style={styles.instructorRow}>
          <Image source={{ uri: course.instructor.avatar }} style={styles.avatar} />
          <Text style={styles.instructor}>{course.instructor.name}</Text>
        </View>
      </View>
    </Pressable>
  );
};

export const CourseCard = memo(CourseCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 12,
    gap: 10,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  title: {
    color: '#111827',
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: '#4b5563',
    lineHeight: 20,
  },
  instructorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  avatar: {
    borderRadius: 10,
    height: 20,
    width: 20,
  },
  instructor: {
    color: '#374151',
    fontWeight: '500',
  },
});
