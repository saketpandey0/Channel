import { useState, useEffect, useRef, useDeferredValue } from "react";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Input } from "../Shad";
import { motion, AnimatePresence } from 'motion/react';
import { contentSearch } from "../../services/featureServices";
import type { StoryPost, Person, Publication, Topic, SearchResults, TabType } from "../../types/searchResult";
import { useNavigate } from "react-router-dom";
import StoryCard from "./cards/StoryCard";
import PersonCard from "./cards/PersonCard";
import PublicationCard from "./cards/PublicationCard";
import TopicCard from "./cards/TopicCard";
import ContentPreview from "../Story/ContentPreview";
import type { Story } from "../../types/story";

export const ContentSearch = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults>({
    stories: [],
    people: [],
    publications: [],
    topics: []
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'people' | 'publications' | 'topics'>('stories');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredInput = useDeferredValue(input);

  useEffect(() => {
    if (deferredInput.length > 0) {
      fetchData(deferredInput);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setSearchResults({
        stories: [],
        people: [],
        publications: [],
        topics: []
      });
      setShowResults(false);
    }
  }, [deferredInput]);

  const fetchData = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const data = await contentSearch(query);
      setSearchResults(data);
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

  const getCurrentResults = () => {
    return searchResults[activeTab] || [];
  };

  const getTotalResults = () => {
    return searchResults.stories.length + searchResults.people.length + 
           searchResults.publications.length + searchResults.topics.length;
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showResults) return;

      const currentResults = getCurrentResults();

      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < currentResults.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : currentResults.length - 1
          );
          break;
        case "Enter":
          if (selectedIndex !== -1) {
            event.preventDefault();
            const selectedItem = currentResults[selectedIndex];
            handleItemClick(selectedItem, activeTab);
          }
          break;
        case "Escape":
          setShowResults(false);
          setIsFocused(false);
          inputRef.current?.blur();
          break;
      }
    };

    if (isFocused) {
      window.addEventListener("keydown", handleKeyPress);
    }
    
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showResults, searchResults, selectedIndex, isFocused, activeTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    if (input.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const clearSearch = () => {
    setInput("");
    setSearchResults({
      stories: [],
      people: [],
      publications: [],
      topics: []
    });
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleItemClick = (item: StoryPost | Person | Publication | Topic, type: TabType) => {
    if (type === 'stories') {
      const storyPost = item as StoryPost;
      const story: Story = {
        id: storyPost.id,
        title: storyPost.title,
        excerpt: storyPost.excerpt,
        content: storyPost.content, 
        coverImage: storyPost.image || '', 
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
      setShowResults(false);
    } else {
      navigate('/search', { 
        state: { 
          searchResults, 
          searchQuery: input, 
          activeTab: type,
          selectedItem: item 
        } 
      });
      setShowResults(false);
    }
  };

  const handleStoryClick = (story: StoryPost) => {
    handleItemClick(story, 'stories');
  };

  const handlePersonClick = (person: Person) => {
    handleItemClick(person, 'people');
  };

  const handlePublicationClick = (publication: Publication) => {
    handleItemClick(publication, 'publications');
  };

  const handleTopicClick = (topic: Topic) => {
    handleItemClick(topic, 'topics');
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  return (
    <>
      <div ref={searchContainerRef} className="relative">
        <motion.div 
          className="relative shadow-lg hidden md:block rounded-full focus:border-blue-400"
          initial={{ width: "200px" }}
          animate={{ width: isFocused ? "400px" : "200px" }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={input}
              onChange={handleInputChange}
              onFocus={handleFocus}
              className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 focus:border-blue-400 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-900"
            />
            {input && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Cross2Icon className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showResults && getTotalResults() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50"
              >
                <div className="flex border-b border-gray-100 p-2">
                  {(['stories', 'people', 'publications', 'topics'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSelectedIndex(-1);
                      }}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        activeTab === tab
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)} ({searchResults[tab].length})
                    </button>
                  ))}
                </div>

                <div className="p-2">
                  {isLoading && (
                    <div className="p-6 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300 mx-auto mb-2"></div>
                      <p>Searching...</p>
                    </div>
                  )}

                  {!isLoading && activeTab === 'stories' && 
                    searchResults.stories.map((story, index) => (
                      <StoryCard 
                        key={story.id}
                        story={story} 
                        index={index}
                        variant="compact"
                        onClick={handleStoryClick}
                      />
                    ))
                  }

                  {!isLoading && activeTab === 'people' && 
                    searchResults.people.map((person, index) => (
                      <PersonCard 
                        key={person.id}
                        person={person} 
                        index={index}
                        variant="compact"
                        onClick={handlePersonClick}
                      />
                    ))
                  }

                  {!isLoading && activeTab === 'publications' && 
                    searchResults.publications.map((publication, index) => (
                      <PublicationCard 
                        key={publication.id}
                        publication={publication} 
                        index={index}
                        variant="compact"
                        onClick={handlePublicationClick}
                      />
                    ))
                  }

                  {!isLoading && activeTab === 'topics' && 
                    searchResults.topics.map((topic, index) => (
                      <TopicCard 
                        key={topic.id}
                        topic={topic} 
                        index={index}
                        variant="compact"
                        onClick={handleTopicClick}
                      />
                    ))
                  }
                </div>
                
                {!isLoading && getTotalResults() === 0 && input.length > 0 && (
                  <div className="p-6 text-center text-gray-500">
                    <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p>No results found for "{input}"</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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