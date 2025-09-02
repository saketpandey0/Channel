export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  authorId: string;
  storyId: string;
  parentId?: string;
  author: User;
  replies: Comment[];
  clapCount: number;
  replyCount: number;
  hasClapped: boolean;
  depth?: number;
  _count?: {
    replies: number;
  };
}

export interface CommentResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ClapData {
  [commentId: string]: {
    clapCount: number;
    userClap: boolean;
  };
}

export interface CommentFormData {
  content: string;
  parentId?: string;
}