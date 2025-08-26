import { useState, useEffect, useRef, useDeferredValue } from "react";
import { Cross2Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import Fuse from "fuse.js";
import { Input } from "../shad/ui/input";
import { motion, AnimatePresence } from 'motion/react';

// Mock blog data - replace with your actual data structure
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  tags: string[];
  image?: string;
  slug: string;
}

// Sample data - replace with your actual data
const mockBlogs: BlogPost[] = [
  {
    id: "1",
    title: "Understanding React Hooks in Modern Development",
    excerpt: "A comprehensive guide to React Hooks and how they revolutionize functional components...",
    author: {
      name: "Jane Doe",
      avatar: "/api/placeholder/40/40"
    },
    publishedAt: "2024-01-15",
    readTime: 8,
    tags: ["React", "JavaScript", "Frontend"],
    image: "/api/placeholder/200/120",
    slug: "understanding-react-hooks"
  },
  {
    id: "2",
    title: "The Future of Web Development: AI and Machine Learning",
    excerpt: "Exploring how artificial intelligence is shaping the future of web development...",
    author: {
      name: "John Smith",
      avatar: "/api/placeholder/40/40"
    },
    publishedAt: "2024-01-10",
    readTime: 12,
    tags: ["AI", "Machine Learning", "Web Development"],
    image: "/api/placeholder/200/120",
    slug: "future-of-web-development-ai"
  },
  {
    id: "3",
    title: "Building Scalable APIs with Node.js and Express",
    excerpt: "Learn how to create robust and scalable APIs using Node.js and Express framework...",
    author: {
      name: "Sarah Wilson",
      avatar: "/api/placeholder/40/40"
    },
    publishedAt: "2024-01-08",
    readTime: 15,
    tags: ["Node.js", "Express", "Backend", "API"],
    image: "/api/placeholder/200/120",
    slug: "scalable-apis-nodejs-express"
  }
];

export const ContentSearch = () => {
  const [input, setInput] = useState("");
  const [searchBlogs, setSearchBlogs] = useState<BlogPost[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredInput = useDeferredValue(input);

  const fuse = new Fuse(mockBlogs, {
    keys: [
      { name: 'title', weight: 0.7 },
      { name: 'excerpt', weight: 0.3 },
      { name: 'author.name', weight: 0.2 },
      { name: 'tags', weight: 0.4 }
    ],
    threshold: 0.3,
    includeScore: true
  });

  useEffect(() => {
    if (deferredInput.length > 0) {
      const results = fuse.search(deferredInput);
      const items = results.map(result => result.item);
      setSearchBlogs(items);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      setSearchBlogs([]);
      setShowResults(false);
    }
  }, [deferredInput]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!showResults) return;

      switch (event.code) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < searchBlogs.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : searchBlogs.length - 1
          );
          break;
        case "Enter":
          if (selectedIndex !== -1) {
            event.preventDefault();
            const selectedBlog = searchBlogs[selectedIndex];
            // Navigate to blog post - replace with your routing logic
            window.open(`/blog/${selectedBlog.slug}`, "_blank");
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
  }, [showResults, searchBlogs, selectedIndex, isFocused]);

  // Click outside to close
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
    setSearchBlogs([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

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
          {showResults && searchBlogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-96 overflow-y-auto z-50"
            >
              <div className="p-2">
                {searchBlogs.map((blog, index) => (
                  <motion.div
                    key={blog.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      index === selectedIndex 
                        ? "bg-gray-100 shadow-sm" 
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                  >
                    <div className="flex gap-3">
                      {blog.image && (
                        <div className="flex-shrink-0">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-16 h-12 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                          {blog.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {blog.excerpt}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <img
                            src={blog.author.avatar}
                            alt={blog.author.name}
                            className="w-4 h-4 rounded-full"
                          />
                          <span>{blog.author.name}</span>
                          <span>·</span>
                          <span>{formatDate(blog.publishedAt)}</span>
                          <span>·</span>
                          <span>{blog.readTime} min read</span>
                        </div>
                        {blog.tags.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {blog.tags.slice(0, 2).map(tag => (
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
                ))}
              </div>
              
              {searchBlogs.length === 0 && input.length > 0 && (
                <div className="p-6 text-center text-gray-500">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p>No articles found for "{input}"</p>
                  <p className="text-sm mt-1">Try different keywords</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Mobile search */}
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
              {searchBlogs.map((blog, index) => (
                <div
                  key={blog.id}
                  className="p-4 border-b border-gray-100 cursor-pointer"
                  onClick={() => window.open(`/blog/${blog.slug}`, "_blank")}
                >
                  <div className="flex gap-3">
                    {blog.image && (
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{blog.author.name}</span>
                        <span>·</span>
                        <span>{formatDate(blog.publishedAt)}</span>
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