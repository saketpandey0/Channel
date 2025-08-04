"use client";

import type React from "react";
import { useEffect } from "react";
import { motion } from "motion/react";
import { X, Heart, MessageCircle, Bookmark, Share, Clock } from "lucide-react";
import type { Story } from "../types/story";

interface ContentPreviewProps {
  story: Story;
  isOpen: boolean;
  onClose: () => void;
}

const ContentPreview: React.FC<ContentPreviewProps> = ({
  story,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Get current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling on body
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      
      // Prevent scroll on document element as well
      document.documentElement.style.overflow = "hidden";
      
      return () => {
        // Restore scroll position and styles
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.documentElement.style.overflow = "";
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Prevent scroll events from bubbling up and handle wheel events
  const handleContentScroll = (e: React.UIEvent) => {
    e.stopPropagation();
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Allow scrolling within the modal content
    const target = e.currentTarget as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // If scrolling up and already at top, prevent default
    if (e.deltaY < 0 && scrollTop === 0) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // If scrolling down and already at bottom, prevent default
    if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // Otherwise allow normal scrolling but stop propagation
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 z-50" onWheel={handleWheel} onTouchMove={handleTouchMove}>
      <button
        onClick={onClose}
        className="fixed top-1 right-4 z-50 flex justify-center items-center w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40 text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
      />

      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[calc(100vh-48px)] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 lg:px-32 py-8 md:py-16"
          onScroll={handleContentScroll}
          style={{ 
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent'
          }}
        >
          <div className="mb-8">
            <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl leading-tight font-bold text-gray-900">
              {story.title}
            </h1>

            <div className="mb-6 flex flex-wrap gap-2">
              {story.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <img
              src={story.author.avatar || "/placeholder.svg"}
              alt={story.author.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {story.author.name}
              </h3>
              <p className="text-sm text-gray-500">@{story.author.username}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-gray-600 transition-colors hover:text-red-500">
                <Heart className="h-5 w-5" />
                <span>{story.claps}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-600 transition-colors hover:text-blue-500">
                <MessageCircle className="h-5 w-5" />
                <span>{story.comments}</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{story.readTime}</span>
              </div>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">{story.publishedAt}</span>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <Bookmark className="h-5 w-5 text-gray-400 hover:text-blue-600" />
              </button>
              <button className="rounded-full p-2 transition-colors hover:bg-gray-100">
                <Share className="h-5 w-5 text-gray-400 hover:text-blue-600" />
              </button>
            </div>
          </div>

          <div className="mb-8 overflow-hidden rounded-xl">
            <img
              src={story.coverImage || "/placeholder.svg"}
              alt={story.title}
              className="h-48 sm:h-64 md:h-80 w-full object-cover"
            />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="mb-6 text-lg sm:text-xl leading-relaxed font-medium text-gray-700">
              {story.excerpt}
            </p>
            <div className="space-y-4 leading-relaxed text-gray-700">
              {story.content ? (
                <div dangerouslySetInnerHTML={{ __html: story.content }} />
              ) : (
                <>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                  <p>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse
                    cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                    cupidatat non proident, sunt in culpa qui officia deserunt
                    mollit anim id est laborum.
                  </p>
                  <p>
                    Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                    accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                    quae ab illo inventore veritatis et quasi architecto beatae
                    vitae dicta sunt explicabo.
                  </p>
                  <p>
                    Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                    aut fugit, sed quia consequuntur magni dolores eos qui ratione
                    voluptatem sequi nesciunt.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="h-20" />
        </div>
      </motion.div>
    </div>
  );
};

export default ContentPreview;