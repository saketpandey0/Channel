export interface StoryPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    username: string;
  };
  coverImage?: string;
  publishedAt: string;
  readTime: string;
  claps: number;
  comments: number;
  bookmarks: number;
  tags: string[];
  image?: string;
  slug: string;
  isPublic: boolean;
  isPremium: boolean;
  allowComments: boolean;
  allowClaps: boolean;
}

export interface Person {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  isVerified: boolean;
  followerCount: number;
}

export interface Publication {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  followerCount: number;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  storyCount: number;
}


export interface SearchResults {
  stories: StoryPost[];
  people: Person[];
  publications: Publication[];
  topics: Topic[];
}

export type TabType = 'stories' | 'people' | 'publications' | 'topics';
