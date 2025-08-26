import { useQuery } from '@tanstack/react-query';
import { getUserNotification } from '../api/updateService';

export const useNotifications = (userId: string) => {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotification,
    enabled: !!userId
  });
};
