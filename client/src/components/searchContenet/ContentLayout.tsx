import type { TabType, SearchResults, StoryPost, Publication, Person, Topic } from "../../types/searchResult";
import {motion} from "motion/react";
import { Search } from "lucide-react";


const ContentLayout: React.FC<{
  activeTab: TabType;
  searchResults: SearchResults;
  isLoading: boolean;
  searchQuery: string;
}> = ({ activeTab, searchResults, isLoading, searchQuery }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStoryItem = (story: StoryPost, index: number) => (
    <motion.div
      key={story.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.open(`/story/${story.slug}`, "_blank")}
    >
      <div className="flex gap-4">
        {story.image && (
          <div className="flex-shrink-0">
            <img
              src={story.image}
              alt={story.title}
              className="w-32 h-24 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {story.title}
          </h2>
          <p className="text-gray-600 mb-3 line-clamp-2">
            {story.excerpt}
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
            {story.author.avatar && (
              <img
                src={story.author.avatar}
                alt={story.author.name}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="font-medium">{story.author.name}</span>
            <span>·</span>
            <span>{formatDate(story.publishedAt)}</span>
            <span>·</span>
            <span>{story.readTime} min read</span>
          </div>
          {story.tags.length > 0 && (
            <div className="flex gap-2">
              {story.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
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

  const renderPersonItem = (person: Person, index: number) => (
    <motion.div
      key={person.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.open(`/user/${person.username}`, "_blank")}
    >
      <div className="flex gap-4">
        {person.avatar && (
          <img
            src={person.avatar}
            alt={person.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {person.name}
            </h2>
            {person.isVerified && (
              <span className="text-blue-500 text-xl">✓</span>
            )}
          </div>
          <p className="text-gray-500 mb-2">@{person.username}</p>
          {person.bio && (
            <p className="text-gray-600 mb-3">
              {person.bio}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {person.followerCount.toLocaleString()} followers
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderPublicationItem = (publication: Publication, index: number) => (
    <motion.div
      key={publication.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.open(`/publication/${publication.slug}`, "_blank")}
    >
      <div className="flex gap-4">
        {publication.image && (
          <img
            src={publication.image}
            alt={publication.name}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {publication.name}
          </h2>
          {publication.description && (
            <p className="text-gray-600 mb-3">
              {publication.description}
            </p>
          )}
          <p className="text-sm text-gray-500">
            {publication.followerCount.toLocaleString()} followers
          </p>
        </div>
      </div>
    </motion.div>
  );

  const renderTopicItem = (topic: Topic, index: number) => (
    <motion.div
      key={topic.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => window.open(`/topic/${topic.name}`, "_blank")}
    >
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {topic.name}
        </h2>
        {topic.description && (
          <p className="text-gray-600 mb-3">
            {topic.description}
          </p>
        )}
        <p className="text-sm text-gray-500">
          {topic.storyCount.toLocaleString()} stories
        </p>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-500">Searching...</p>
        </div>
      </div>
    );
  }

  const currentResults = searchResults[activeTab];
  
  if (currentResults.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center py-12">
        <div className="text-center">
          <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {activeTab} found</h3>
          <p className="text-gray-500">No results found for "{searchQuery}" in {activeTab}</p>
          <p className="text-sm text-gray-400 mt-1">Try different keywords or check other tabs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="space-y-4">
        {activeTab === 'stories' && searchResults.stories.map(renderStoryItem)}
        {activeTab === 'people' && searchResults.people.map(renderPersonItem)}
        {activeTab === 'publications' && searchResults.publications.map(renderPublicationItem)}
        {activeTab === 'topics' && searchResults.topics.map(renderTopicItem)}
      </div>
    </div>
  );
};


export default ContentLayout;