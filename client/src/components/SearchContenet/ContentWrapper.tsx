import { useState, useEffect } from "react";
import type { TabType, SearchResults, StoryPost, Person, Publication, Topic } from "../../types/searchResult";
import ContentHeader from "./ContentHeader";
import ContentLayout from "./ContentLayout";
import ContentSidebar from "./ContentSidebar";
import ContentPreview from "../Story/ContentPreview";
import type { Story } from "../../types/story";
import { useLocation, useNavigate } from "react-router-dom";
import { contentSearch } from "../../services/featureServices";

const ContentWrapper: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchResults: initialResults, searchQuery: initialQuery, activeTab: initialTab, selectedItem } = location.state || {};

  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'stories');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults>(initialResults || {
    stories: [],
    people: [],
    publications: [],
    topics: []
  });
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery || '');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    if (selectedItem && initialTab) {
      handleItemNavigation(selectedItem, initialTab);
    }
  }, [selectedItem, initialTab]);

  useEffect(() => {
    if (!initialResults && !initialQuery) {
      navigate('/');
    }
  }, [initialResults, initialQuery, navigate]);

  const handleItemNavigation = (item: StoryPost | Person | Publication | Topic, type: TabType) => {
    switch (type) {
      case 'stories':
        const storyPost = item as StoryPost;
        const story: Story = {
          id: storyPost.id,
          title: storyPost.title,
          excerpt: storyPost.excerpt,
          content: storyPost.content,
          coverImage: storyPost.image,
          author: storyPost.author,
          tags: storyPost.tags,
          publishedAt: storyPost.publishedAt,
          readTime: `${storyPost.readTime} min read`,
          claps: 0,
          comments: 0,
          bookmarks: 0,
          slug: storyPost.slug,
          isPublic: storyPost.isPublic,
          isPremium: storyPost.isPremium,
          allowComments: storyPost.allowComments,
          allowClaps: storyPost.allowClaps,
        };
        setSelectedStory(story);
        break;
      case 'people':
        const person = item as Person;
        window.open(`/user/${person.username}`, "_blank");
        break;
      case 'publications':
        const publication = item as Publication;
        window.open(`/publication/${publication.slug}`, "_blank");
        break;
      case 'topics':
        const topic = item as Topic;
        window.open(`/topic/${topic.name}`, "_blank");
        break;
    }
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  const handleNewSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchQuery(query);
    
    try {
      const data = await contentSearch(query);
      setSearchResults(data);
      
      // Update URL state
      navigate('/search', { 
        state: { 
          searchResults: data, 
          searchQuery: query, 
          activeTab: 'stories'
        },
        replace: true
      });
      
      setActiveTab('stories');
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        stories: [],
        people: [],
        publications: [],
        topics: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state if we're still fetching initial data
  if (isLoading && !searchResults.stories.length && !searchResults.people.length && 
      !searchResults.publications.length && !searchResults.topics.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading search results...</p>
        </div>
      </div>
    );
  }

  const totalResults = searchResults.stories.length + searchResults.people.length +  searchResults.publications.length + searchResults.topics.length;

  if (totalResults === 0 && searchQuery) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="mb-6">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-600 mb-3">No results found</h2>
            <p className="text-gray-500 mb-6">
              We couldn't find anything matching "{searchQuery}". Try different keywords or browse our categories.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <ContentHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchResults={searchResults}
          searchQuery={searchQuery}
          onNewSearch={handleNewSearch}
        />
        
        <div className="max-w-6xl mx-auto flex">
          <ContentLayout
            activeTab={activeTab}
            searchResults={searchResults}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
          
          <ContentSidebar
            searchResults={searchResults}
            activeTab={activeTab}
          />
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

export default ContentWrapper;