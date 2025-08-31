import type { SearchResults, TabType, StoryPost, Person, Publication, Topic } from "../../types/searchResult";
import { Star, TrendingUp } from "lucide-react";

const ContentSidebar: React.FC<{
  searchResults: SearchResults;
  activeTab: TabType;
}> = ({ searchResults, activeTab }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSidebarStory = (story: StoryPost, index: number) => (
    <div key={story.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
        {story.title}
      </h4>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span>{story.author.name}</span>
        <span>·</span>
        <span>{formatDate(story.publishedAt)}</span>
      </div>
    </div>
  );

  const renderSidebarPerson = (person: Person, index: number) => (
    <div key={person.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <div className="flex items-center gap-2">
        {person.avatar && (
          <img
            src={person.avatar}
            alt={person.name}
            className="w-8 h-8 rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {person.name}
            </h4>
            {person.isVerified && <span className="text-blue-500 text-sm">✓</span>}
          </div>
          <p className="text-xs text-gray-500">{person.followerCount.toLocaleString()} followers</p>
        </div>
      </div>
    </div>
  );

  const renderSidebarPublication = (publication: Publication, index: number) => (
    <div key={publication.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <div className="flex items-center gap-2">
        {publication.image && (
          <img
            src={publication.image}
            alt={publication.name}
            className="w-8 h-8 rounded"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {publication.name}
          </h4>
          <p className="text-xs text-gray-500">{publication.followerCount.toLocaleString()} followers</p>
        </div>
      </div>
    </div>
  );

  const renderSidebarTopic = (topic: Topic, index: number) => (
    <div key={topic.id} className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
      <h4 className="text-sm font-medium text-gray-900 mb-1">
        {topic.name}
      </h4>
      <p className="text-xs text-gray-500">{topic.storyCount.toLocaleString()} stories</p>
    </div>
  );

  const sections = [
    { 
      key: 'stories' as const, 
      title: 'Top Stories', 
      icon: <Star className="w-4 h-4" />,
      data: searchResults.stories.slice(0, 3),
      renderer: renderSidebarStory
    },
    { 
      key: 'people' as const, 
      title: 'Popular People', 
      icon: <TrendingUp className="w-4 h-4" />,
      data: searchResults.people.slice(0, 3),
      renderer: renderSidebarPerson
    },
    { 
      key: 'publications' as const, 
      title: 'Top Publications', 
      icon: <Star className="w-4 h-4" />,
      data: searchResults.publications.slice(0, 3),
      renderer: renderSidebarPublication
    },
    { 
      key: 'topics' as const, 
      title: 'Trending Topics', 
      icon: <TrendingUp className="w-4 h-4" />,
      data: searchResults.topics.slice(0, 3),
      renderer: renderSidebarTopic
    }
  ];

  return (
    <div className="w-80 bg-gray-50 p-4 space-y-6">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Stories</span>
            <span className="text-sm font-medium">{searchResults.stories.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">People</span>
            <span className="text-sm font-medium">{searchResults.people.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Publications</span>
            <span className="text-sm font-medium">{searchResults.publications.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Topics</span>
            <span className="text-sm font-medium">{searchResults.topics.length}</span>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        section.data.length > 0 && (
          <div key={section.key} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              {section.icon}
              <h3 className="font-medium text-gray-900">{section.title}</h3>
            </div>
            <div className="space-y-1">
              {section.data.map((item, index) => section.renderer(item as any, index))}
            </div>
          </div>
        )
      ))}
    </div>
  );
};


export default ContentSidebar;