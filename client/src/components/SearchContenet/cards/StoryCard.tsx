import type { StoryPost } from "../../../types/searchResult";
import { motion } from "motion/react";
import { formatDate } from "../index";
import { useNavigate } from "react-router-dom";

type StoryCardProps = {
  story: StoryPost;
  index: number;
  variant?: "compact" | "detailed";
  onClick?: (story: StoryPost) => void;
};

const StoryCard = ({ story, index, variant = "compact" , onClick }: StoryCardProps) => {
  const navigate = useNavigate();
  const baseAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 },
  };

  const handleClick = () => {
    if(onClick){
      onClick(story);
    }else {
      navigate(`/story/${story.slug}`);
    }
  };

  return (
    <motion.div
      key={story.id}
      {...baseAnimation}
      className={`cursor-pointer rounded-lg transition-all duration-200 ${
        variant === "compact"
          ? `${"hover:bg-gray-50 dark:hover:bg-black"} p-3`
          : "border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md"
      }`}
      onClick={() => handleClick}
    >
      <div className={`flex ${variant === "compact" ? "gap-3" : "gap-4"}`}>
        {story.image && (
          <div className="flex-shrink-0">
            <img
              src={story.image}
              alt={story.title}
              className={
                (variant === "compact" ? "h-12 w-16" : "h-24 w-32") +
                " rounded-lg object-cover"
              }
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2
            className={
              variant === "compact"
                ? "mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white"
                : "mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white"
            }
          >
            {story.title}
          </h2>

          <p
            className={
              variant === "compact"
                ? "mb-2 line-clamp-2 text-xs text-gray-600"
                : "mb-3 line-clamp-2 text-gray-600"
            }
          >
            {story.excerpt}
          </p>

          <div
            className={`flex items-center gap-2 text-gray-500 ${
              variant === "compact" ? "text-xs" : "mb-3 text-sm"
            }`}
          >
            {story.author.avatar && (
              <img
                src={story.author.avatar}
                alt={story.author.name}
                className={
                  (variant === "compact" ? "h-4 w-4" : "h-6 w-6") +
                  " rounded-full"
                }
              />
            )}
            <span className={ variant === "compact" ? "" : "font-medium"}>
              {story.author.name}
            </span>
            <span>·</span>
            <span>{formatDate(story.publishedAt)}</span>
            <span>·</span>
            <span>{story.readTime} min read</span>
          </div>

          {story.tags.length > 0 && (
            <div
              className={`flex ${variant === "compact" ? "mt-2 gap-1" : "gap-2"}`}
            >
              {story.tags
                .slice(0, variant === "compact" ? 2 : story.tags.length)
                .map((tag) => (
                  <span
                    key={tag}
                    className={
                      variant === "compact"
                        ? "rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                        : "rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    }
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StoryCard;
