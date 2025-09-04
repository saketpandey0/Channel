export type Author = {
  id: string
  name: string
  username: string // Fixed typo from 'usernsame'
  avatar: string
}

export type Story = {
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


export type StoryParams = {
  page?: number
  limit?: number
  tag?: string
  authorId?: string
  publication?: string
  search?: string,
  status?: 'PUBLISHED' | 'DRAFT'
}

export interface Comment {
    id: string;
    content: string;
    author: {
        id: string;
        name: string;
        username: string;
        avatar: string;
        isVerified: boolean;
    },
    createdAt: string;
    updatedAt: string;
    parentId: string;
    replies: Comment[];
    clapCount: number;
    replyCount: number;
    isEdited: boolean;
}