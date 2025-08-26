export interface ProfileUser {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
  storyCount: number;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  location?: string;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface ProfileViewContext {
  isOwner: boolean;
  isFollowing?: boolean;
  canMessage?: boolean;
  canReport?: boolean;
}

export interface ProfileTabConfig {
  id: string;
  name: string;
  count?: number;
  visible: boolean;
  component: React.ComponentType<any>;
}