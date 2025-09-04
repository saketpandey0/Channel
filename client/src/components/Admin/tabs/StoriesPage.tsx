import React, { useEffect, useState } from "react";
import { getAdminStories } from "../../../services/adminservice"; 
import type { AdminStory } from "../../../types/admin";

const StoriesPage: React.FC = () => {
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const result = await getAdminStories(1, 10);
        if (result.success && result.data) {
          setStories(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch stories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  if (loading) return <div>Loading stories...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Stories</h2>
      <ul className="space-y-2">
        {stories.map((story) => (
          <li
            key={story.id}
            className="border rounded p-3 hover:bg-gray-50"
          >
            <h3 className="font-bold">{story.title}</h3>
            <p className="text-sm text-gray-600">By {story.author.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StoriesPage;
