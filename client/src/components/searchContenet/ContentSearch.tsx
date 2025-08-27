import { useState, useEffect, useRef, useDeferredValue } from "react";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Input } from "../shad";
import { motion, AnimatePresence } from 'motion/react';
import { contentSearch } from "../../api/featureServices";
import type { StoryPost, Person, Publication, Topic, SearchResults, TabType } from "../../types/searchResult";
import { useNavigate } from "react-router-dom";
import { formatDate} from "./index";


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
            if (activeTab === 'stories') {
              window.open(`/story/${(selectedItem as StoryPost).slug}`, "_blank");
            } else if (activeTab === 'people') {
              window.open(`/user/${(selectedItem as Person).username}`, "_blank");
            } else if (activeTab === 'publications') {
              window.open(`/publication/${(selectedItem as Publication).slug}`, "_blank");
            } else if (activeTab === 'topics') {
              window.open(`/topic/${(selectedItem as Topic).name}`, "_blank");
            }
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


  const handleItemClick = (item: StoryPost | Person | Publication | Topic, type:TabType) => {
    navigate('/search', { 
      state: { 
        searchResults, 
        searchQuery: input, 
        activeTab: type,
        selectedItem: item 
      } 
    });
  }

  const renderStoryItem = (story: StoryPost, index: number) => (
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
  );

  const renderPersonItem = (person: Person, index: number) => (
    <motion.div
      key={person.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        index === selectedIndex 
          ? "bg-gray-100 shadow-sm" 
          : "hover:bg-gray-50"
      }`}
      onClick={() => window.open(`/user/${person.username}`, "_blank")}
    >
      <div className="flex gap-3">
        {person.avatar && (
          <img
            src={person.avatar}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">
              {person.name}
            </h3>
            {person.isVerified && (
              <span className="text-blue-500">✓</span>
            )}
          </div>
          <p className="text-xs text-gray-500">@{person.username}</p>
          {person.bio && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
              {person.bio}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {person.followerCount} followers
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
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        index === selectedIndex 
          ? "bg-gray-100 shadow-sm" 
          : "hover:bg-gray-50"
      }`}
      onClick={() => window.open(`/publication/${publication.slug}`, "_blank")}
    >
      <div className="flex gap-3">
        {publication.image && (
          <img
            src={publication.image}
            alt={publication.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            {publication.name}
          </h3>
          {publication.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
              {publication.description}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {publication.followerCount} followers
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
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        index === selectedIndex 
          ? "bg-gray-100 shadow-sm" 
          : "hover:bg-gray-50"
      }`}
      onClick={() => window.open(`/topic/${topic.name}`, "_blank")}
    >
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-gray-900">
          {topic.name}
        </h3>
        {topic.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mt-1">
            {topic.description}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {topic.storyCount} stories
        </p>
      </div>
    </motion.div>
  );

  return (
    <div ref={searchContainerRef} className="relative">
      <motion.div 
        className="relative shadow-lg hidden md:block"
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
            placeholder="Search articles..."
            value={input}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 focus:border-gray-400 focus:ring-0 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
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
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50"
            >
              {/* Tab Navigation */}
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
                        : 'text-gray-600 hover:text-gray-900'
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

                {!isLoading && activeTab === 'stories' && searchResults.stories.map(renderStoryItem)}
                {!isLoading && activeTab === 'people' && searchResults.people.map(renderPersonItem)}
                {!isLoading && activeTab === 'publications' && searchResults.publications.map(renderPublicationItem)}
                {!isLoading && activeTab === 'topics' && searchResults.topics.map(renderTopicItem)}
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

      {/* Mobile search - keeping original implementation for now */}
      <div className="md:hidden">
        <button
          onClick={() => {
            setIsFocused(true);
            inputRef.current?.focus();
          }}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
        
        {isFocused && (
          <div className="fixed inset-0 bg-white z-50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  setIsFocused(false);
                  setShowResults(false);
                  setInput("");
                }}
                className="p-2"
              >
                ←
              </button>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search articles..."
                value={input}
                onChange={handleInputChange}
                className="flex-1 border-none focus:ring-0 text-lg"
                autoFocus
              />
            </div>
            
            <div className="space-y-4">
              {searchResults.stories.map((story, index) => (
                <div
                  key={story.id}
                  className="p-4 border-b border-gray-100 cursor-pointer"
                  onClick={() => window.open(`/story/${story.slug}`, "_blank")}
                >
                  <div className="flex gap-3">
                    {story.image && (
                      <img
                        src={story.image}
                        alt={story.title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {story.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {story.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{story.author.name}</span>
                        <span>·</span>
                        <span>{formatDate(story.publishedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};