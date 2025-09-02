"use client";

import type React from "react";
import { MessageCircle, Bookmark, Share, Clock } from "lucide-react";
import { PiHandsClappingThin } from "react-icons/pi";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../Shad";

import type { Story } from "../../types/story";

interface StoriesProps extends Story {
  onClick: () => void;
}

const Stories: React.FC<StoriesProps> = ({
  title,
  excerpt,
  author,
  readTime,
  publishedAt,
  claps,
  comments,
  coverImage,
  tags,
  onClick,
}) => {
  return (
    <article
      className="group relative z-10 cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-slate-100 shadow-sm shadow-slate-700/50 transition-all duration-300 hover:shadow-md dark:border-gray-700 dark:bg-black"
      onClick={onClick}
    >
      <div className="flex h-64">
        <div className="flex flex-1 flex-col justify-between p-6">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img
                src={author.avatar || "/placeholder.svg"}
                alt={author.name}
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {author.name}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500 dark:text-gray-200">
                {publishedAt}
              </span>
            </div>

            <h2 className="mb-3 line-clamp-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-200">
              {title}
            </h2>

            <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-600">
              {excerpt}
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <TooltipProvider>
            <div className="flex w-full items-center gap-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{readTime}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>read time</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <PiHandsClappingThin className="h-5 w-5 cursor-pointer" />
                    <span>{claps > 0 ? claps : ""}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{claps} claps</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4 cursor-pointer" />
                    <span>{comments > 0 ? comments : ""}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>{comments} comments</TooltipContent>
              </Tooltip>

              <div className="ml-auto flex items-center gap-5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Bookmark className="h-4 w-4 cursor-pointer text-gray-400 hover:text-blue-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Bookmark</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="rounded-full transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share className="h-4 w-4 cursor-pointer text-gray-400 hover:text-blue-600" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </TooltipProvider>
        </div>

        <div className="relative w-48 overflow-hidden">
          <img
            src={coverImage || "/placeholder.svg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>
    </article>
  );
};

export default Stories;
