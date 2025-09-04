import { useQuery } from '@tanstack/react-query';
import { getUserNotification } from '../services/updateService';

export const useNotifications = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotification,
    enabled: !!userId
  });
};
