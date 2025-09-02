import { motion, AnimatePresence } from "motion/react";
import { useBookmarks } from "../../../hooks/useBookmarks";
import Stories from "../../Story/Stories";
import type { ProfileViewContext } from "../../../types/profile";

interface BookmarksTabProps {
  storyId: string;
  userId: string;
  viewContext: ProfileViewContext;
  onBookmarkClick: (bookmark: any) => void;
  hovered: number | null;
  setHovered: (index: number | null) => void;
}

const BookmarksTab: React.FC<BookmarksTabProps> = ({
  storyId,
  userId,
  viewContext,
  onBookmarkClick,
  hovered,
  setHovered
}) => {
  const { data, isLoading, bookmarked, toggleBookmark } = useBookmarks(userId, storyId, false);

  if (!viewContext.isOwner) {
    return <div className="p-6 text-center text-gray-600">Access denied</div>;
  }

  if (isLoading) {
    return <div className="p-6">Loading bookmarks...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No bookmarks yet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Bookmark stories to read them later.
        </p>
      </div>
    );
  }

  return (
    <div className="px-2 pb-1">
      {data.map((bookmark: any, index: number) => (
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
            {...bookmark.story}
            onClick={() => onBookmarkClick(bookmark.story)}
            showBookmarkDate={bookmark.createdAt}
          />
        </div>
      ))}
    </div>
  );
};

export default BookmarksTab;