import { useEffect } from 'react';
import {
  notifyIfInactiveFor24Hours,
  requestNotificationPermissions,
} from '@/services/notifications';

export const useAppBootstrap = () => {
  useEffect(() => {
    const bootstrap = async () => {
      await requestNotificationPermissions();
      await notifyIfInactiveFor24Hours();
    };

    void bootstrap();
  }, []);
};
