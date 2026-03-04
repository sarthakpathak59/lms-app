import { storage } from '@/utils/storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LAST_OPENED_KEY = 'last_opened_at';
const BOOKMARK_NOTIFICATION_KEY = 'bookmark_threshold_notified';
const INACTIVITY_NOTIFICATION_ID_KEY = 'inactivity_notification_id';
const DAY_IN_SECONDS = 24 * 60 * 60;
const DEFAULT_CHANNEL_ID = 'learning-reminders';
let notificationsInitialized = false;

const isAndroidExpoGo =
  Platform.OS === 'android' &&
  (Constants.executionEnvironment === 'storeClient' ||
    Constants.appOwnership === 'expo');

const getNotificationsModule = (): any | null => {
  if (isAndroidExpoGo) {
    return null;
  }

  try {
    // Optional dependency in this environment.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications');
  } catch {
    return null;
  }
};

const initializeNotifications = async (): Promise<any | null> => {
  const Notifications = getNotificationsModule();

  if (!Notifications) {
    return null;
  }

  if (notificationsInitialized) {
    return Notifications;
  }

  notificationsInitialized = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Learning Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 200, 200, 200],
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  return Notifications;
};

export const requestNotificationPermissions = async (): Promise<void> => {
  const Notifications = await initializeNotifications();

  if (!Notifications) {
    return;
  }

  const settings = await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
};

export const notifyBookmarkMilestone = async (
  bookmarkCount: number
): Promise<void> => {
  if (bookmarkCount < 5) {
    await storage.remove(BOOKMARK_NOTIFICATION_KEY);
    return;
  }

  const alreadyNotified = await storage.getString(BOOKMARK_NOTIFICATION_KEY);

  if (alreadyNotified === 'true') {
    return;
  }

  const Notifications = await initializeNotifications();

  if (!Notifications) {
    return;
  }

  const settings = await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    const requested = await Notifications.requestPermissionsAsync();
    if (!requested.granted) {
      return;
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Great progress',
      body: 'You bookmarked 5+ courses. Keep learning!',
      channelId: DEFAULT_CHANNEL_ID,
    },
    trigger: null,
  });

  await storage.setString(BOOKMARK_NOTIFICATION_KEY, 'true');
};

export const notifyIfInactiveFor24Hours = async (): Promise<void> => {
  const Notifications = await initializeNotifications();

  if (!Notifications) {
    return;
  }

  const now = Date.now();
  const lastOpened = await storage.getString(LAST_OPENED_KEY);

  if (lastOpened) {
    const elapsedMs = now - Number(lastOpened);
    const dayMs = 24 * 60 * 60 * 1000;

    if (elapsedMs >= dayMs) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'We miss you',
          body: 'Resume your learning streak today.',
          channelId: DEFAULT_CHANNEL_ID,
        },
        trigger: null,
      });
    }
  }

  await storage.setString(LAST_OPENED_KEY, String(now));
};

export const refreshInactivityReminder = async (): Promise<void> => {
  const Notifications = await initializeNotifications();

  if (!Notifications) {
    return;
  }

  const settings = await Notifications.getPermissionsAsync();

  if (!settings.granted) {
    return;
  }

  const previousNotificationId = await storage.getString(
    INACTIVITY_NOTIFICATION_ID_KEY
  );

  if (previousNotificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(previousNotificationId);
    } catch {
      // Notification may have already fired or been cleared by OS.
    }
  }

  const timeIntervalTrigger =
    Notifications?.SchedulableTriggerInputTypes?.TIME_INTERVAL != null
      ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: DAY_IN_SECONDS,
          repeats: false,
        }
      : {
          type: 'timeInterval',
          seconds: DAY_IN_SECONDS,
          repeats: false,
        };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'We miss you',
      body: 'It has been 24 hours. Resume your learning streak today.',
      channelId: DEFAULT_CHANNEL_ID,
    },
    trigger: timeIntervalTrigger,
  });

  await Promise.all([
    storage.setString(INACTIVITY_NOTIFICATION_ID_KEY, notificationId),
    storage.setString(LAST_OPENED_KEY, String(Date.now())),
  ]);
};
