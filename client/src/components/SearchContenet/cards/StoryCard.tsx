import type { StoryPost } from "../../../types/searchResult";
import {motion} from "motion/react";
import { formatDate } from "../index";

type StoryCardProps = {
  story: StoryPost;
  index: number;
  variant?: "compact" | "detailed";
};

const StoryCard = ({ story, index, variant = "compact" }: StoryCardProps) => {
    const baseAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: index * 0.05 }
  };

  return (
    <motion.div
      key={story.id}
      {...baseAnimation}
      className={`cursor-pointer transition-all duration-200 rounded-lg ${
        variant === "compact"
          ? `${index === 0 ? "bg-gray-100 shadow-sm" : "hover:bg-gray-50"} p-3`
          : "bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md"
      }`}
      onClick={() => window.open(`/story/${story.slug}`, "_blank")}
    >
      <div className={`flex ${variant === "compact" ? "gap-3" : "gap-4"}`}>
        {story.image && (
          <div className="flex-shrink-0">
            <img
                src={story.image}
                alt={story.title}
                className={
                    (variant === "compact" ? "w-16 h-12" : "w-32 h-24") + " object-cover rounded-lg"
                }
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2
            className={
              variant === "compact"
                ? "text-sm font-semibold text-gray-900 line-clamp-2 mb-1"
                : "text-lg font-semibold text-gray-900 mb-2 line-clamp-2"
            }
          >
            {story.title}
          </h2>

          <p
            className={
              variant === "compact"
                ? "text-xs text-gray-600 line-clamp-2 mb-2"
                : "text-gray-600 mb-3 line-clamp-2"
            }
          >
            {story.excerpt}
          </p>

          <div
            className={`flex items-center gap-2 text-gray-500 ${
              variant === "compact" ? "text-xs" : "text-sm mb-3"
            }`}
          >
            {story.author.avatar && (
              <img
                src={story.author.avatar}
                alt={story.author.name}
                className={(variant === "compact" ? "w-4 h-4" : "w-6 h-6") + " rounded-full" }
              />
            )}
            <span className={variant === "compact" ? "" : "font-medium"}>
              {story.author.name}
            </span>
            <span>·</span>
            <span>{formatDate(story.publishedAt)}</span>
            <span>·</span>
            <span>{story.readTime} min read</span>
          </div>

          {story.tags.length > 0 && (
            <div className={`flex ${variant === "compact" ? "gap-1 mt-2" : "gap-2"}`}>
              {story.tags
                .slice(0, variant === "compact" ? 2 : story.tags.length)
                .map((tag) => (
                  <span
                    key={tag}
                    className={
                      variant === "compact"
                        ? "px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        : "px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
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