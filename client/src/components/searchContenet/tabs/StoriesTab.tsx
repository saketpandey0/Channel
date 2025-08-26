import { motion, AnimatePresence } from "motion/react";
import { useStories } from "../../../hooks/useStories";
import Stories from "../../story/Stories";
import type { ProfileViewContext } from "../../../types/profile";

interface StoriesTabProps {
  userId: string;
  viewContext: ProfileViewContext;
  onStoryClick: (story: any) => void;
  hovered: number | null;
  setHovered: (index: number | null) => void;
}

const StoriesTab: React.FC<StoriesTabProps> = ({
  userId,
  viewContext,
  onStoryClick,
  hovered,
  setHovered
}) => {
  const { data: stories, isLoading } = useStories({ 
    authorId: userId,
    status: viewContext.isOwner ? undefined : 'PUBLISHED'
  });

  if (isLoading) {
    return <div className="p-6">Loading stories...</div>;
  }

  if (!stories || stories.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">
          {viewContext.isOwner 
            ? "You haven't written anything yet." 
            : "This user hasn't published any stories yet."
          }
        </p>
        {viewContext.isOwner && (
          <button className="mt-4 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800">
            Write your first story
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="px-2 pb-1">
      {stories.map((story, index) => (
        <div
          key={story.id}
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
            {...story}
            onClick={() => onStoryClick(story)}
            // showStatus={viewContext.isOwner}
          />
        </div>
      ))}
    </div>
  );
};

export default StoriesTab;