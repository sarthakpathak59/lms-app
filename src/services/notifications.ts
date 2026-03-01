import { storage } from '@/utils/storage';

const LAST_OPENED_KEY = 'last_opened_at';
const BOOKMARK_NOTIFICATION_KEY = 'bookmark_threshold_notified';

const getNotificationsModule = (): any | null => {
  try {
    // Optional dependency in this environment.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications');
  } catch {
    return null;
  }
};

export const requestNotificationPermissions = async (): Promise<void> => {
  const Notifications = getNotificationsModule();

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

  const Notifications = getNotificationsModule();

  if (!Notifications) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Great progress',
      body: 'You bookmarked 5+ courses. Keep learning!',
    },
    trigger: null,
  });

  await storage.setString(BOOKMARK_NOTIFICATION_KEY, 'true');
};

export const notifyIfInactiveFor24Hours = async (): Promise<void> => {
  const Notifications = getNotificationsModule();

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
        },
        trigger: null,
      });
    }
  }

  await storage.setString(LAST_OPENED_KEY, String(now));
};
