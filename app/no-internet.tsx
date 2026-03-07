import { NoInternetState } from '@/components/NoInternetState';
import { useCourses } from '@/context/CourseContext';

export default function NoInternetScreen() {
  const { refreshCourses, courses } = useCourses();

  const hasCachedData = courses.length > 0;

  return (
    <NoInternetState
      cachedCount={courses.length}
      hasCachedData={hasCachedData}
      onRetry={refreshCourses}
    />
  );
}
