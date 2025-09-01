import { getUserBookmarks, toogleBookmark } from '../api/featureServices';
import { useEffect, useState } from 'react';



export const useBookmarks = (userId: string, storyId: string, status?: boolean) => {
  const [bookmarked, setBookmarked] = useState(status || false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const data = await getUserBookmarks();
        console.log("data", data);
        setBookmarked(data.isFollowing);
        setData(data);
      } catch (error) {
        console.error('Failed to fetch follow status:', error);
      }
    };

    if (userId) {
      fetchFollowStatus();
    }
  }, [bookmarked, userId]);

  const toggleBookmark = async () => {
    setIsLoading(true);
    try {
      await toogleBookmark(storyId);
      setBookmarked((prev) => !prev);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { bookmarked, toggleBookmark, isLoading, data };
};
