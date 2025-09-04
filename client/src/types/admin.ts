export interface AdminTab {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  path: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalStories: number;
  publishedStories: number;
  totalPublications: number;
  pendingReports: number;
  newUsersThisWeek: number;
  newStoriesThisWeek: number;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'READER' | 'WRITER' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED';
  isVerified: boolean;
  createdAt: string;
  lastActiveAt: string;
  avatar?: string;
  followersCount: number;
  followingCount: number;
  _count: {
    stories: number;
    followers: number;
    following: number;
  };
}

export interface AdminStory {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'UNLISTED' | 'ARCHIVED';
  author: {
    id: string;
    username: string;
    name: string;
  };
  publication?: {
    id: string;
    name: string;
    slug: string;
  };
  viewCount: number;
  clapCount: number;
  commentCount: number;
  createdAt: string;
  publishedAt?: string;
  _count: {
    reports: number;
  };
}


export interface Report {
  id: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  reportedBy: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  story?: {
    id: string;
    title: string;
    author: {
      id: string;
      username: string;
      name: string;
    };
  };
  comment?: {
    id: string;
    content: string;
    author: {
      id: string;
      username: string;
      name: string;
    };
  };
  user?: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
}


// src/types/index.ts

export interface Analytics {
  users: {
    total: number;
    byStatus: { status: string; _count: { id: number } }[];
  };
  stories: {
    total: number;
    totalViews: number;
    totalClaps: number;
    totalComments: number;
  };
  publications: {
    total: number;
  };
  engagement: {
    active_readers: number;
    avg_reading_time: number;
    avg_progress: number;
  };
  growth: {
    month: string;
    new_users?: number;
    new_stories?: number;
    type: string;
  }[];
}

export interface AdvancedAnalytics {
  timeframe: string;
  userGrowth: { createdAt: string; _count: { id: number } }[];
  contentGrowth: { publishedAt: string; _count: { id: number } }[];
  engagement: {
    average: {
      viewCount: number;
      clapCount: number;
      commentCount: number;
    };
    total: {
      viewCount: number;
      clapCount: number;
      commentCount: number;
    };
  };
  topAuthors: {
    id: string;
    username: string;
    name: string;
    avatar: string;
    totalViews: number;
    totalClaps: number;
    totalComments: number;
    _count: { stories: number };
  }[];
  topStories: {
    id: string;
    title: string;
    slug: string;
    viewCount: number;
    clapCount: number;
    commentCount: number;
    author: {
      id: string;
      username: string;
      name: string;
      avatar: string;
    };
  }[];
  retention: {
    returningReaders: number;
    avgStoriesPerReader: number;
    avgReadingProgress: number;
  };
}
