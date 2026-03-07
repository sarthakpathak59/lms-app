import { CourseCard } from '@/components/CourseCard';
import { AppScreen } from '@/components/AppScreen';
import { LegendList } from '@/components/LegendList';
import { NoInternetState } from '@/components/NoInternetState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useCourses } from '@/context/CourseContext';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const isLandscape = width > height;

function CoursesPortrait() {
  const {
    filteredCourses,
    search,
    setSearch,
    loading,
    refreshing,
    error,
    isOffline,
    courses,
    bookmarkedCourseIds,
    preferences,
    refreshCourses,
    toggleBookmark,
    setShowOnlyBookmarked,
  } = useCourses();

  const bookmarkSet = useMemo(() => new Set(bookmarkedCourseIds), [bookmarkedCourseIds]);
  const hasNoCourses = courses.length === 0;

  if (!loading && isOffline && hasNoCourses) {
    return (
      <NoInternetState
        cachedCount={0}
        hasCachedData={false}
        onRetry={refreshCourses}
      />
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Courses</Text>
        <Text style={styles.subtitle}>Explore and bookmark what to learn next</Text>
      </View>

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
          extraData={bookmarkedCourseIds}
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
    </AppScreen>
  );
}

function CoursesLandscape() {
  const {
    filteredCourses,
    search,
    setSearch,
    loading,
    refreshing,
    error,
    isOffline,
    courses,
    bookmarkedCourseIds,
    preferences,
    refreshCourses,
    toggleBookmark,
    setShowOnlyBookmarked,
  } = useCourses();

  const bookmarkSet = useMemo(() => new Set(bookmarkedCourseIds), [bookmarkedCourseIds]);
  const hasNoCourses = courses.length === 0;

  if (!loading && isOffline && hasNoCourses) {
    return (
      <NoInternetState
        cachedCount={0}
        hasCachedData={false}
        onRetry={refreshCourses}
      />
    );
  }

  return (
    <AppScreen contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Courses</Text>
        <Text style={styles.subtitle}>Landscape view with quick browsing</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          onChangeText={setSearch}
          placeholder="Search courses..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInputLandscape}
          value={search}
        />
      </View>

      <Pressable
        onPress={() => setShowOnlyBookmarked(!preferences.showOnlyBookmarked)}
        style={styles.filterChip}
      >
        <Text style={styles.filterText}>
          {preferences.showOnlyBookmarked ? '★ Bookmarked' : '☆ All Courses'}
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
          contentContainerStyle={styles.listContentLandscape}
          data={filteredCourses}
          extraData={bookmarkedCourseIds}
          keyExtractor={item => item.id}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshCourses} />
          }
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <CourseCard
                course={item}
                isBookmarked={bookmarkSet.has(item.id)}
                onPress={() => router.push(`/course/${item.id}` as never)}
                onToggleBookmark={() => toggleBookmark(item.id)}
              />
            </View>
          )}
        />
      )}
    </AppScreen>
  );
}

export default function CoursesScreen() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    isLandscape ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription.remove();
  }, []);

  if (orientation === 'landscape') {
    return <CoursesLandscape />;
  }

  return <CoursesPortrait />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 8,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 14,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#0f172a',
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    marginTop: 4,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 13,
  },
  searchInputLandscape: {
    backgroundColor: '#fff',
    borderColor: '#dbe4f0',
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 16,
    padding: 11,
  },
  searchRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  filterChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterText: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  listContentLandscape: {
    paddingBottom: 24,
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  cardContainer: {
    flex: 1,
    padding: 8,
  },
  error: {
    color: '#dc2626',
    marginHorizontal: 16,
    marginTop: 10,
  },
});
