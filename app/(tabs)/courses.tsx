import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useCourses } from '@/context/CourseContext';
import { CourseCard } from '@/components/CourseCard';
import { LegendList } from '@/components/LegendList';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function CoursesScreen() {
  const {
    filteredCourses,
    search,
    setSearch,
    loading,
    refreshing,
    error,
    isOffline,
    bookmarkedCourseIds,
    preferences,
    refreshCourses,
    toggleBookmark,
    setShowOnlyBookmarked,
  } = useCourses();

  const bookmarkSet = useMemo(() => new Set(bookmarkedCourseIds), [bookmarkedCourseIds]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses</Text>

      <TextInput
        onChangeText={setSearch}
        placeholder="Search by title, instructor or description"
        placeholderTextColor="#9ca3af"
        style={styles.searchInput}
        value={search}
      />

      <Pressable
        onPress={() => setShowOnlyBookmarked(!preferences.showOnlyBookmarked)}
        style={styles.filterChip}
      >
        <Text style={styles.filterText}>
          {preferences.showOnlyBookmarked
            ? 'Showing bookmarked only'
            : 'Show bookmarked only'}
        </Text>
      </Pressable>

      {isOffline ? <OfflineBanner /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <LegendList
          contentContainerStyle={styles.listContent}
          data={filteredCourses}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshCourses} />
          }
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              isBookmarked={bookmarkSet.has(item.id)}
              onPress={() => router.push(`/course/${item.id}` as never)}
              onToggleBookmark={() => toggleBookmark(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
    flex: 1,
    paddingTop: 8,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 12,
  },
  filterChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    color: '#1e40af',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  error: {
    color: '#dc2626',
    marginHorizontal: 16,
    marginTop: 10,
  },
});
