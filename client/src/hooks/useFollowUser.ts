import { useState } from 'react';

export const useFollowUser = (userId: string, initialFollowing?: boolean) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing || false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, toggleFollow, isLoading };
};
