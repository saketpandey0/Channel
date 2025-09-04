import type { TabType, SearchResults, StoryPost, Publication, Person, Topic } from "../../types/searchResult";
import { Search } from "lucide-react";
import StoryCard from "./cards/StoryCard";
import PersonCard from "./cards/PersonCard";
import PublicationCard from "./cards/PublicationCard";
import TopicCard from "./cards/TopicCard";
import ContentPreview from "../Story/ContentPreview";
import type { Story } from "../../types/story";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ContentLayout: React.FC<{
  activeTab: TabType;
  searchResults: SearchResults;
  isLoading: boolean;
  searchQuery: string;
}> = ({ activeTab, searchResults, isLoading, searchQuery }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const navigate = useNavigate();

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
    navigate(`/${person.username}/about`);
  };

  const handlePublicationClick = (publication: Publication) => {
    navigate(`/publication/${publication.slug}`);
  };

  const handleTopicClick = (topic: Topic) => {
    navigate(`/result/${topic.name}/topic`);
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

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
    <>
      <div className="flex-1 p-6">
        <div className="space-y-4">
          {activeTab === 'stories' && 
            searchResults.stories.map((story, index) => (
              <StoryCard 
                key={story.id}
                story={story}
                index={index}
                variant="detailed"
                onClick={handleStoryClick}
              />
            ))
          }
          
          {activeTab === 'people' && 
            searchResults.people.map((person, index) => (
              <PersonCard 
                key={person.id}
                person={person}
                index={index}
                variant="detailed"
                onClick={handlePersonClick}
              />
            ))
          }
          
          {activeTab === 'publications' && 
            searchResults.publications.map((publication, index) => (
              <PublicationCard 
                key={publication.id}
                publication={publication}
                index={index}
                variant="detailed"
                onClick={handlePublicationClick}
              />
            ))
          }
          
          {activeTab === 'topics' && 
            searchResults.topics.map((topic, index) => (
              <TopicCard 
                key={topic.id}
                topic={topic}
                index={index}
                variant="detailed"
                onClick={handleTopicClick}
              />
            ))
          }
        </div>
      </div>

      {/* Content Preview for Stories */}
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

export default ContentLayout;