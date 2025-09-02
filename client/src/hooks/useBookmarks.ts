import { getStoryBookmarks, toogleBookmark } from '../api/featureServices';
import { useCallback, useEffect, useState } from 'react';





export const useBookmarks = (storyId: string) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const fetchStoryBookmarks = useCallback( async ()=> {
    try{
      const data = await getStoryBookmarks(storyId);
      setBookmarked(data.bookmarked);
      setBookmarkCount(data.bookmarkCount);
    }catch(err){
      console.error("Error fetching bookmarks", err);
    }
  },[]);
  
  useEffect(()=> {
    fetchStoryBookmarks();
  }, [storyId])


  const handleBookmark = useCallback(async (storyId: string)=> {
    try {
      const data = await toogleBookmark(storyId);
      setBookmarked(data.bookmarkCount);
      setBookmarkCount( prev => data.bookmarked ? prev + 1 : Math.max(prev - 1, 0));
    }catch(err){
      console.error("Error toggling bookmark", err);
    }
  },[storyId]);

  return { bookmarked, bookmarkCount, handleBookmark };
}



