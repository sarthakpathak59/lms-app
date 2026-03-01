import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { fetchCoursesWithInstructors } from '@/services/course.service';
import { notifyBookmarkMilestone } from '@/services/notifications';
import { Course, UserStats } from '@/types/course';
import { getErrorMessage, isNetworkError } from '@/utils/error';
import { storage } from '@/utils/storage';

const BOOKMARKS_KEY = 'bookmarks';
const ENROLLED_KEY = 'enrolled_courses';
const PREFERENCES_KEY = 'user_preferences';

interface Preferences {
  showOnlyBookmarked: boolean;
}

interface CourseContextType {
  courses: Course[];
  filteredCourses: Course[];
  search: string;
  setSearch: (value: string) => void;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  isOffline: boolean;
  bookmarkedCourseIds: string[];
  enrolledCourseIds: string[];
  preferences: Preferences;
  refreshCourses: () => Promise<void>;
  toggleBookmark: (courseId: string) => Promise<void>;
  enroll: (courseId: string) => Promise<boolean>;
  setShowOnlyBookmarked: (value: boolean) => Promise<void>;
  getCourseById: (courseId: string) => Course | undefined;
  stats: UserStats;
}

const defaultPreferences: Preferences = {
  showOnlyBookmarked: false,
};

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [bookmarkedCourseIds, setBookmarkedCourseIds] = useState<string[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const hydrate = async () => {
      const [bookmarks, enrolled, prefs] = await Promise.all([
        storage.getJSON<string[]>(BOOKMARKS_KEY, []),
        storage.getJSON<string[]>(ENROLLED_KEY, []),
        storage.getJSON<Preferences>(PREFERENCES_KEY, defaultPreferences),
      ]);

      setBookmarkedCourseIds(bookmarks);
      setEnrolledCourseIds(enrolled);
      setPreferences(prefs);
    };

    void hydrate();
  }, []);

  const fetchCourses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const nextCourses = await fetchCoursesWithInstructors();
      setCourses(nextCourses);
      setIsOffline(false);
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load courses right now.'));
      if (isNetworkError(err)) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchCourses(false);
  }, [fetchCourses]);

  const refreshCourses = useCallback(async () => {
    await fetchCourses(true);
  }, [fetchCourses]);

  const toggleBookmark = useCallback(
    async (courseId: string) => {
      const nextBookmarks = bookmarkedCourseIds.includes(courseId)
        ? bookmarkedCourseIds.filter(id => id !== courseId)
        : [...bookmarkedCourseIds, courseId];

      setBookmarkedCourseIds(nextBookmarks);
      await storage.setJSON(BOOKMARKS_KEY, nextBookmarks);
      await notifyBookmarkMilestone(nextBookmarks.length);
    },
    [bookmarkedCourseIds]
  );

  const enroll = useCallback(
    async (courseId: string): Promise<boolean> => {
      if (enrolledCourseIds.includes(courseId)) {
        return false;
      }

      const nextEnrolled = [...enrolledCourseIds, courseId];
      setEnrolledCourseIds(nextEnrolled);
      await storage.setJSON(ENROLLED_KEY, nextEnrolled);
      return true;
    },
    [enrolledCourseIds]
  );

  const setShowOnlyBookmarked = useCallback(
    async (value: boolean) => {
      const next = {
        ...preferences,
        showOnlyBookmarked: value,
      };

      setPreferences(next);
      await storage.setJSON(PREFERENCES_KEY, next);
    },
    [preferences]
  );

  const getCourseById = useCallback(
    (courseId: string) => courses.find(course => course.id === courseId),
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses.filter(course => {
      const searchable = `${course.title} ${course.description} ${course.instructor.name}`.toLowerCase();
      const matchesSearch = !query || searchable.includes(query);
      const matchesBookmark =
        !preferences.showOnlyBookmarked ||
        bookmarkedCourseIds.includes(course.id);

      return matchesSearch && matchesBookmark;
    });
  }, [bookmarkedCourseIds, courses, preferences.showOnlyBookmarked, search]);

  const stats = useMemo<UserStats>(() => {
    const enrolledCount = enrolledCourseIds.length;
    const bookmarkCount = bookmarkedCourseIds.length;
    const denominator = Math.max(courses.length, 1);

    return {
      enrolledCount,
      bookmarkCount,
      progressPercent: Math.round((enrolledCount / denominator) * 100),
    };
  }, [bookmarkedCourseIds.length, courses.length, enrolledCourseIds.length]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        filteredCourses,
        search,
        setSearch,
        loading,
        refreshing,
        error,
        isOffline,
        bookmarkedCourseIds,
        enrolledCourseIds,
        preferences,
        refreshCourses,
        toggleBookmark,
        enroll,
        setShowOnlyBookmarked,
        getCourseById,
        stats,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);

  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }

  return context;
};
