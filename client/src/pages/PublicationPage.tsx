import { Card, CardHeader, Avatar, CardTitle, Button } from "../components/Shad";
import { getPublication } from "../api/publicationsService";
import { useEffect, useState } from "react";  
import { useLocation, useParams } from "react-router-dom";
import { PublicationSkeleton } from "../components/Skeleton/PublicationSkeleton";
import { MailPlus } from 'lucide-react';
import ContentPreview from '../components/Story/ContentPreview';
import type {Story} from '../types/story';


export default function PublicationPage() {
  const publicationId = useParams().id;
  const [publicationData, setPublicationData] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStory, setSelectedStory] = useState<string | null>('');


  const handleStoryClick = (storyId: string) => {
    setSelectedStory(storyId);
  }

  const handleClosePreview = () => {
    setSelectedStory(null);
  }


  useEffect(() => {
    const fetchPublicationData = async () => {
      try {
        setLoading(true);
        const data = await getPublication(publicationId);
        setPublicationData(data);
      } catch (err: any) {
        console.error(err);
      }
    };
    setLoading(false);
    fetchPublicationData();
  }, [publicationId]);

  return (
    <Card className="mx-auto max-w-7xl min-h-screen rounded-xl border border-gray-100 bg-slate-100 px-4 py-8 shadow-sm sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <CardHeader className="min-h-[10rem] bg-blue-300 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-row gap-6 items-center">
              <Avatar className="h-16 w-16 bg-green-200">A</Avatar>
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">Publication Title</CardTitle>
                <p className="text-sm text-gray-700">Publication bio goes here</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>123 followers</span>
                  <span>5 editors</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="bg-black rounded-full text-slate-300">Follow</Button>
              <Button className="bg-black rounded-full">
                <MailPlus className="w-4 h-4 text-slate-300 " />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
            publicationData.stories.map((item, index) => (
              <div className="w-full rounded-xl border border-gray-100 bg-red-100 px-6 py-8 shadow-sm"
                onClick={() => handleStoryClick(item)}
               >
                <div className="object-cover">{item.image}</div>
                <div className="text-center text-gray-800 font-medium">{item.title}</div>
                <div className="flex flex-row gap-2 items-center">
                  <Avatar>{item.avatar}</Avatar>
                  <div className="text-center text-gray-800 font-medium">{item.author}</div>
                  <div className="text-center text-gray-800 font-medium">{item.publishedAt}</div>
                  <div className="text-center text-gray-800 font-medium">{item.readTime} min read</div>
                </div>
              </div>
            ))
          </div>
        )
        : <PublicationSkeleton/>}
        {
          selectedStory && <ContentPreview storyId={selectedStory}  onClose={handleClosePreview} />
        }
      </div>
    </Card>
  );
}
