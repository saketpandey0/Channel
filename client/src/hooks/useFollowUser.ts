import { useEffect, useState } from 'react';
import { toggleUserFollow, getUserFollowData } from '../api/featureServices';

export const useFollowUser = (userId: string, initialFollowing?: boolean) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing || false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>({});

  useEffect(() => {
    const fetchFollowStatus = async () => {
      try {
        const data = await getUserFollowData(userId);
        setIsFollowing(data.isFollowing);
        setData(data);
      } catch (error) {
        console.error('Failed to fetch follow status:', error);
      }
    };

    if (userId) {
      fetchFollowStatus();
    }
  }, [isFollowing, userId]);

  const toggleFollow = async () => {
    setIsLoading(true);
    try {
      await toggleUserFollow(userId);
      setIsFollowing((prev) => !prev);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, toggleFollow, isLoading, data };
};
