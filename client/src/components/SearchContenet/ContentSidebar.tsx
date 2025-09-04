import type { SearchResults, TabType, StoryPost, Person, Publication, Topic } from "../../types/searchResult";
import { Star, TrendingUp } from "lucide-react";
import StoryCard from "./cards/StoryCard";
import PersonCard from "./cards/PersonCard";
import PublicationCard from "./cards/PublicationCard";
import TopicCard from "./cards/TopicCard";
import ContentPreview from "../Story/ContentPreview";
import type { Story } from "../../types/story";
import { useState } from "react";

const ContentSidebar: React.FC<{
  searchResults: SearchResults;
  activeTab: TabType;
}> = ({ searchResults, activeTab }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleStoryClick = (story: StoryPost) => {
    const storyForPreview: Story = {
      id: story.id,
      title: story.title,
      excerpt: story.excerpt,
      content: story.content, 
      coverImage: story.image,
      author: story.author,
      tags: story.tags,
      publishedAt: story.publishedAt,
      readTime: `${story.readTime} min read`,
      claps: 0, 
      comments: 0,
      bookmarks: 0,
      slug: story.slug,
      isPublic: story.isPublic,
      isPremium: story.isPremium,
      allowComments: story.allowComments,
      allowClaps: story.allowClaps,
    };
    setSelectedStory(storyForPreview);
  };

  const handlePersonClick = (person: Person) => {
    window.open(`/user/${person.username}`, "_blank");
  };

  const handlePublicationClick = (publication: Publication) => {
    window.open(`/publication/${publication.slug}`, "_blank");
  };

  const handleTopicClick = (topic: Topic) => {
    window.open(`/topic/${topic.name}`, "_blank");
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  const sections = [
    { 
      key: 'stories' as const, 
      title: 'Top Stories', 
      icon: <Star className="w-4 h-4" />,
      data: searchResults.stories.slice(0, 3),
      onClick: handleStoryClick
    },
    { 
      key: 'people' as const, 
      title: 'Popular People', 
      icon: <TrendingUp className="w-4 h-4" />,
      data: searchResults.people.slice(0, 3),
      onClick: handlePersonClick
    },
    { 
      key: 'publications' as const, 
      title: 'Top Publications', 
      icon: <Star className="w-4 h-4" />,
      data: searchResults.publications.slice(0, 3),
      onClick: handlePublicationClick
    },
    { 
      key: 'topics' as const, 
      title: 'Trending Topics', 
      icon: <TrendingUp className="w-4 h-4" />,
      data: searchResults.topics.slice(0, 3),
      onClick: handleTopicClick
    }
  ];

  const renderCard = (item: any, index: number, type: TabType, onClick: (item: any) => void) => {
    const props = {
      key: item.id,
      index,
      variant: "compact" as const,
      onClick
    };

    switch (type) {
      case 'stories':
        return <StoryCard story={item} {...props} />;
      case 'people':
        return <PersonCard person={item} {...props} />;
      case 'publications':
        return <PublicationCard publication={item} {...props} />;
      case 'topics':
        return <TopicCard topic={item} {...props} />;
      default:
        return null;
    }
  };

  return (
    <>
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
                {section.data.map((item, index) => 
                  renderCard(item, index, section.key, section.onClick)
                )}
              </div>
            </div>
          )
        ))}
      </div>

      {selectedStory && (
        <ContentPreview 
          story={selectedStory}  
          isOpen={!!selectedStory}
          onClose={handleClosePreview} 
        />
      )}
    </>
  );
};

export default ContentSidebar;