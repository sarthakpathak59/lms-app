import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourses } from '@/context/CourseContext';
import { AppScreen } from '@/components/AppScreen';

export default function CourseDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

  const {
    getCourseById,
    bookmarkedCourseIds,
    toggleBookmark,
    enroll,
    enrolledCourseIds,
  } = useCourses();

  const course = courseId ? getCourseById(courseId) : undefined;

  if (!course) {
    return (
      <AppScreen contentContainerStyle={styles.centered}>
        <Text style={styles.error}>Course not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </AppScreen>
    );
  }

  const isBookmarked = bookmarkedCourseIds.includes(course.id);
  const isEnrolled = enrolledCourseIds.includes(course.id);

  const handleEnroll = async () => {
    const enrolled = await enroll(course.id);

    if (enrolled) {
      Alert.alert('Enrolled', 'You are now enrolled in this course.');
      return;
    }

    Alert.alert('Already enrolled', 'This course is already in your enrolled list.');
  };

  return (
    <AppScreen contentContainerStyle={styles.container} scroll>
      <Image source={{ uri: course.thumbnail }} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title}>{course.title}</Text>
        <Text style={styles.instructor}>By {course.instructor.name}</Text>
        <Text style={styles.description}>{course.description}</Text>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleEnroll}
            style={[styles.actionButton, isEnrolled ? styles.actionButtonMuted : null]}
          >
            <Text style={styles.actionButtonText}>
              {isEnrolled ? 'Enrolled' : 'Enroll'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => toggleBookmark(course.id)}
            style={styles.secondaryAction}
          >
            <Text style={styles.secondaryActionText}>
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/webview/${course.id}` as never)}
          style={styles.openContentButton}
        >
          <Text style={styles.openContentText}>Open Embedded Content</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back to courses</Text>
        </TouchableOpacity>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    height: 220,
    marginTop: 8,
    width: '100%',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '700',
  },
  instructor: {
    color: '#475569',
    marginTop: 8,
  },
  description: {
    color: '#334155',
    lineHeight: 22,
    marginTop: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#1d4ed8',
    borderRadius: 12,
    flex: 1,
    padding: 13,
  },
  actionButtonMuted: {
    backgroundColor: '#059669',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryAction: {
    alignItems: 'center',
    borderColor: '#1d4ed8',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    padding: 13,
  },
  secondaryActionText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  openContentButton: {
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 12,
    marginTop: 14,
    padding: 13,
  },
  openContentText: {
    color: '#fff',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
    marginTop: 14,
    padding: 10,
  },
  backButtonText: {
    color: '#334155',
    fontWeight: '500',
  },
  error: {
    color: '#dc2626',
    fontSize: 16,
  },
});
