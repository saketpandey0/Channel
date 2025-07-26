"use client"

import type React from "react"
import { Heart, MessageCircle, Bookmark, Share, Clock } from "lucide-react"
import type { Story } from "../types/story"

interface StoriesProps extends Story {
  onClick: () => void
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
      className="relative z-10 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md"
      onClick={onClick}
    >
      <div className="flex h-64">
        {/* Content Section */}
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img
                src={author.avatar || "/placeholder.svg"}
                alt={author.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-700">{author.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-500">{publishedAt}</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h2>

            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">{excerpt}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{readTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{claps}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                <span>{comments}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Bookmark className="w-4 h-4 text-gray-400 hover:text-blue-600" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Share className="w-4 h-4 text-gray-400 hover:text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="w-48 relative overflow-hidden">
          <img
            src={coverImage || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </article>
  )
}

export default Stories
