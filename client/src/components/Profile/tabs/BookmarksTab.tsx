import { motion, AnimatePresence } from "motion/react";
import Stories from "../../Story/Stories";
import type { ProfileViewContext } from "../../../types/profile";
import { useEffect, useState } from "react";
import {getUserBookmarks} from "../../../services/featureServices";

interface BookmarksTabProps {
  storyId: string;
  userId: string;
  viewContext: ProfileViewContext;
  onBookmarkClick: (bookmark: any) => void;
  hovered: number | null;
  setHovered: (index: number | null) => void;
}

const BookmarksTab: React.FC<BookmarksTabProps> = ({
  onBookmarkClick,
  hovered,
  setHovered
}) => {
  const [bookmarkStories, setBookmarkStories] = useState([]);

  useEffect(()=> {
    const fetchBookmarks = async () => {
      try {
        const data = await getUserBookmarks(); 
        console.log(data)
        setBookmarkStories(data);              
      } catch (err) {
        console.error("Error fetching user bookmarks", err);
      }
    };

    fetchBookmarks();
  },[])

  const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="px-2 pb-1">
      {bookmarkStories.map((bookmark: any, index: number) => (
        <div
          key={bookmark.id}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          className="relative mt-4"
        >
          <AnimatePresence>
            {hovered === index && (
              <motion.div
                layoutId="hovered-content"
                className="absolute inset-0 h-full w-full rounded-xl bg-neutral-200 shadow-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
          <Stories
            {...bookmark}
            readTime={`${bookmark.readTime} min read`}
            publishedAt={formatDate(bookmark.publishedAt)}
            claps={bookmark.clapCount || bookmark.claps || 0}
            comments={bookmark.commentCount || bookmark.comments || 0}
            tags={bookmark.tags || []}
            onClick={() => onBookmarkClick(bookmark)}
          />
        </div>
      ))}
    </div>
  );
};

export default BookmarksTab;