import { Card, CardHeader, Avatar, CardTitle, Button } from "../components/Shad";
import { getPublication } from "../api/publicationsService";
import { useEffect, useState } from "react";  
import { useParams } from "react-router-dom";
import { PublicationSkeleton } from "../components/Skeleton/PublicationSkeleton";
import { MailPlus } from 'lucide-react';
import ContentPreview from '../components/Story/ContentPreview';
import type { Story } from "../types/story";

// Define types for the publication data
interface PublicationUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  bio?: string;
}

interface PublicationEditor {
  user: PublicationUser;
}

interface PublicationWriter {
  user: PublicationUser;
}

interface PublicationData {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  coverImage: string | null;
  owner: PublicationUser;
  editors: PublicationEditor[];
  writers: PublicationWriter[];
  stories: Story[];
  _count: {
    stories: number;
    subscribers: number;
  };
}

interface PublicationResponse {
  publication: PublicationData;
}

export default function PublicationPage() {
  const { id: publicationId } = useParams<{ id: string }>();
  const [publicationData, setPublicationData] = useState<PublicationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const handleStoryClick = (story: Story) => {
    setSelectedStory(story);
  };

  const handleClosePreview = () => {
    setSelectedStory(null);
  };

  useEffect(() => {
    const fetchPublicationData = async () => {
      if (!publicationId) return;
      
      try {
        setLoading(true);
        const response: PublicationResponse = await getPublication(publicationId);
        setPublicationData(response.publication);
      } catch (err: any) {
        console.error('Error fetching publication:', err);
        setPublicationData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicationData();
  }, [publicationId]);

  if (loading) {
    return (
      <Card className="mx-auto max-w-7xl min-h-screen rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
        <PublicationSkeleton />
      </Card>
    );
  }

  if (!publicationData) {
    return (
      <Card className="mx-auto max-w-7xl min-h-screen rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Publication not found</h2>
            <p className="text-gray-500">The publication you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-7xl min-h-screen rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <CardHeader className="min-h-[10rem] bg-gradient-to-r from-blue-300 to-blue-400 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <Avatar className="h-16 w-16 bg-white/20 text-white text-xl font-semibold">
                {publicationData.avatar ? (
                  <img src={publicationData.avatar} alt={publicationData.name} className="w-full h-full object-cover" />
                ) : (
                  publicationData.name.charAt(0).toUpperCase()
                )}
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-xl font-bold text-white">
                  {publicationData.name}
                </CardTitle>
                <p className="text-sm text-white/90 max-w-md">
                  {publicationData.description || "No description available"}
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-white/80">
                  <span>{publicationData._count.subscribers} followers</span>
                  <span>{publicationData.editors.length + publicationData.writers.length} editors</span>
                  <span>{publicationData._count.stories} stories</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all">
                Follow
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-sm transition-all" size="icon">
                <MailPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="w-full">
          {publicationData.stories && publicationData.stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-6">
              {publicationData.stories.map((story) => (
                <div 
                  key={story.id}
                  className="w-full rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-6 py-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => handleStoryClick(story)}
                >
                  {story.coverImage && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img 
                        src={story.coverImage} 
                        alt={story.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    
                    {story.excerpt && (
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {story.excerpt}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6 text-xs">
                          {story.author?.avatar ? (
                            <img src={story.author.avatar} alt={story.author.name} className="w-full h-full object-cover" />
                          ) : (
                            story.author?.name?.charAt(0).toUpperCase()
                          )}
                        </Avatar>
                        <span className="text-sm text-gray-700 font-medium">
                          {story.author?.name || 'Anonymous'}
                        </span>
                      </div>
                      
                      <span className="text-gray-400">•</span>
                      
                      <span className="text-sm text-gray-500">
                        {story.publishedAt ? new Date(story.publishedAt).toLocaleDateString() : 'Draft'}
                      </span>
                      
                      <span className="text-gray-400">•</span>
                      
                      <span className="text-sm text-gray-500">
                        {story.readTime || '5'} min read
                      </span>
                    </div>

                    {story.tags && story.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {story.tags.slice(0, 3).map((tag, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {story.tags.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{story.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-semibold mb-2">No stories published yet</h3>
                <p>This publication hasn't published any stories.</p>
              </div>
            </div>
          )}
        </div>

        {selectedStory && (
          <ContentPreview 
            story={selectedStory}  
            isOpen={!!selectedStory}
            onClose={handleClosePreview} 
          />
        )}
      </div>
    </Card>
  );
}