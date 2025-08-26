import { useQuery } from '@tanstack/react-query';
import { getUserBookmarks } from '../api/featureServices';

export const useBookmarks = (userId: string) => {
  return useQuery({
    queryKey: ['bookmarks', userId],
    queryFn: () => getUserBookmarks(userId),
    enabled: !!userId
  });
};
