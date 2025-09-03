import { getStoryBookmarks, toogleBookmark } from '../api/featureServices';
import { useCallback, useEffect, useState } from 'react';




export const useBookmarks = (storyId: string) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const fetchStoryBookmarks = useCallback(async () => {
    try {
      const data = await getStoryBookmarks(storyId);
      setBookmarked(data.bookmarked);
      setBookmarkCount(data.bookmarkCount);
    } catch(err) {
      console.error("Error fetching bookmarks", err);
    }
  }, [storyId]); 

  useEffect(() => {
    fetchStoryBookmarks();
  }, [storyId, fetchStoryBookmarks]); 

  const handleBookmark = useCallback(async (storyId: string) => {
    try {
      const data = await toogleBookmark(storyId);
      console.log(data.bookmarkCount);
      setBookmarked(data.bookmarked); 
      setBookmarkCount(prev => data.bookmarked ? prev + 1 : Math.max(prev - 1, 0));
    } catch(err) {
      console.error("Error toggling bookmark", err);
    }
  }, [storyId]);
  console.log("bookmarked", bookmarked);
  console.log("bookmarkCount", bookmarkCount);
  return { bookmarked, bookmarkCount, handleBookmark };
};