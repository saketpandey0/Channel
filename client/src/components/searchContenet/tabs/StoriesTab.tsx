import type{ StoryPost } from "../../../types/searchResult";
import motion from "motion/react";




export const renderStoryItem = (story: StoryPost, index: number) => {
  return (
    <motion.div
      key={story.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        index === selectedIndex 
          ? "bg-gray-100 shadow-sm" 
          : "hover:bg-gray-50"
      }`}
      onClick={() => window.open(`/story/${story.slug}`, "_blank")}
    >
      <div className="flex gap-3">
        {story.image && (
          <div className="flex-shrink-0">
            <img
              src={story.image}
              alt={story.title}
              className="w-16 h-12 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
            {story.title}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
            {story.excerpt}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {story.author.avatar && (
              <img
                src={story.author.avatar}
                alt={story.author.name}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span>{story.author.name}</span>
            <span>·</span>
            <span>{formatDate(story.publishedAt)}</span>
            <span>·</span>
            <span>{story.readTime} min read</span>
          </div>
          {story.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {story.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
};