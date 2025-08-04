import React from 'react';
import { TrendingUp, Users, BookOpen, Star, Plus, ArrowRight } from 'lucide-react';

const Sidebar: React.FC = () => {
  const trendingAuthors = [
    { name: 'Sarah Chen', followers: '12.5k', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150', specialty: 'Tech & Innovation' },
    { name: 'Marcus Johnson', followers: '8.7k', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150', specialty: 'Design & UX' },
    { name: 'Elena Rodriguez', followers: '15.2k', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150', specialty: 'Business Strategy' },
  ];

  const trendingTopics = [
    { name: 'Artificial Intelligence', posts: 1284, growth: '+23%' },
    { name: 'Web Development', posts: 2156, growth: '+18%' },
    { name: 'Startup Stories', posts: 892, growth: '+31%' },
    { name: 'Design Systems', posts: 654, growth: '+15%' },
    { name: 'Remote Work', posts: 1023, growth: '+27%' },
  ];

  const followingActivity = [
    { name: 'Alex Kim', action: 'published', title: 'The Future of React Development', time: '2h ago' },
    { name: 'Maria Santos', action: 'liked', title: 'Building Scalable APIs', time: '4h ago' },
    { name: 'James Wilson', action: 'commented on', title: 'TypeScript Best Practices', time: '6h ago' },
  ];

  return (
    <div className="space-y-6">
      {/* Trending Authors */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">  
            <Star className="w-5 h-5 text-yellow-500" />
            Trending Authors
          </h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            See all <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-4">
          {trendingAuthors.map((author, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{author.name}</p>
                  <p className="text-xs text-gray-500">{author.specialty}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">{author.followers}</p>
                <button className="mt-1 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-medium rounded-full transition-colors flex items-center gap-1">
                  <Plus className="w-3 h-3" />
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Trending Topics
          </h3>
        </div>
        
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-gray-900 text-sm">{topic.name}</p>
                <p className="text-xs text-gray-500">{topic.posts} posts</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {topic.growth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Following Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Following Activity
          </h3>
        </div>
        
        <div className="space-y-4">
          {followingActivity.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.name}</span> {activity.action} 
                  <span className="font-medium"> "{activity.title}"</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reading List */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your Reading List</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">Save articles to read later and build your personal knowledge base.</p>
        <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
          View Reading List
        </button>
      </div>
    </div>
  );
};

export default Sidebar;