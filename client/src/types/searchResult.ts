export interface StoryPost {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  publishedAt: string;
  readTime: number;
  tags: string[];
  image?: string;
  slug: string;
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
