import { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCourses } from '@/context/CourseContext';

const getWebViewModule = (): any | null => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('react-native-webview');
  } catch {
    return null;
  }
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export default function WebContentScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getCourseById } = useCourses();
  const course = courseId ? getCourseById(courseId) : undefined;

  const webViewModule = getWebViewModule();
  const WebView = webViewModule?.WebView;

  const html = useMemo(() => {
    if (!course) {
      return '<html><body><h1>Course unavailable</h1></body></html>';
    }

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; color: #111827; }
            .pill { display: inline-block; padding: 4px 10px; border-radius: 20px; background: #dbeafe; color: #1e40af; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(course.title)}</h1>
          <p class="pill">Instructor: ${escapeHtml(course.instructor.name)}</p>
          <p>${escapeHtml(course.description)}</p>
          <script>
            window.ReactNativeWebView?.postMessage('webview_loaded');
          </script>
        </body>
      </html>
    `;
  }, [course]);

  if (!course) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>Course not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!WebView) {
    return (
      <View style={styles.centered}>
        <Text style={styles.message}>WebView package is not installed in this environment.</Text>
        <Text style={styles.subMessage}>
          Install `react-native-webview` to enable embedded content rendering.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Close</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Course Content</Text>
        <View style={styles.spacer} />
      </View>

      <WebView
        onError={() => Alert.alert('WebView error', 'Failed to load embedded content.')}
        onMessage={(event: { nativeEvent: { data: string } }) => {
          if (event.nativeEvent.data === 'webview_loaded') {
            // Native-to-Web communication verification point.
          }
        }}
        source={{
          html,
          headers: {
            'X-Course-Id': course.id,
            'X-Instructor-Name': course.instructor.name,
          },
        }}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  topBar: {
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  topBarTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  spacer: {
    width: 40,
  },
  webview: {
    flex: 1,
  },
  message: {
    color: '#111827',
    fontSize: 16,
    textAlign: 'center',
  },
  subMessage: {
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 12,
  },
});
