"use client";

import Stories from "./Stories";
import Sidebar from "../Sidebar";
import ContentPreview from "./ContentPreview";
import { useState, useEffect } from "react";
import { ReactLenis } from "lenis/react";
import { useStories } from "../../hooks/useStories";
import { motion, AnimatePresence } from "motion/react";
import type { Story } from "../../types/story";

export const StoriesLayout = () => {
  const [sidebarFixed, setSidebarFixed] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const {
    data: stories,
    isLoading,
    isError,
  } = useStories({ page: 1, limit: 10 });

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const threshold = window.innerHeight * 1.5;
      setSidebarFixed(scrolled < threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const blogPosts = stories || [];

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading stories</div>;

  return (
    <ReactLenis root>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <main className="max-w-4xl flex-1">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  Latest Stories
                </h2>
                <p>
                  Discover the latest Insights from our community of writers
                </p>
              </div>

              <div className="relative-group space-y-6">
                {blogPosts.map((post, index) => (
                  <div
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    className="relative"
                    key={post.id || index}
                  >
                    <AnimatePresence>
                      {hovered === index && (
                        <motion.div
                          key={`hover-${index}`}
                          layoutId="hovered-post"
                          className="absolute inset-0 h-full w-full rounded-xl bg-neutral-200 shadow-md"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                    <Stories {...post} onClick={() => handleStoryClick(post)} />
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <button className="rounded-lg border border-gray-300 bg-white px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  Load More Stories
                </button>
              </div>
            </main>

            <aside className={`w-80 transition-all duration-300 hidden md:block`}>
              <Sidebar />
            </aside>
          </div>
        </div>

        {/* Content Preview Modal */}
        <AnimatePresence>
          {selectedStory && (
            <ContentPreview
              story={selectedStory}
              isOpen={!!selectedStory}
              onClose={handleClosePreview}
            />
          )}
        </AnimatePresence>
      </div>
    </ReactLenis>
  );
};
