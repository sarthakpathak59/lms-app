import { useEffect } from 'react';
import {
  refreshInactivityReminder,
  requestNotificationPermissions,
} from '@/services/notifications';

export const useAppBootstrap = () => {
  useEffect(() => {
    const bootstrap = async () => {
      await requestNotificationPermissions();
      await refreshInactivityReminder();
    };

    void bootstrap();
  }, []);
};
