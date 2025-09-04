import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import type { ProfileUser, ProfileViewContext } from '../types/profile';
import { getUserFollowData } from '../services/featureServices';
import { fetchUserProfile } from '../services/authService';

export const useProfileContext = (profileUsername: string) => {
  const { useCurrentUser } = useAuth();
  const { data: user } = useCurrentUser();
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [viewContext, setViewContext] = useState<ProfileViewContext>({
    isOwner: false,
    isFollowing: false,
    canMessage: false,
    canReport: true
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try { 
        const profile = await fetchUserProfile(profileUsername);
        console.log("Fetched profile: ", profile);
        setProfileUser(profile);

        const isOwner = user?.username === profileUsername;
        let isFollowing = false;
        
        if (!isOwner && user) {
          isFollowing = await getUserFollowData(profile.id);
        }

        setViewContext({
          isOwner,
          isFollowing,
          canMessage: !isOwner && !!user,
          canReport: !isOwner && !!user
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profileUsername, user]);

  return { profileUser, viewContext, isLoading };
};
