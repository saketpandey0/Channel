export interface Notification {
  id: string;
  type: 'STORY_PUBLISHED' | 'COMMENT_RECEIVED' | 'CLAP_RECEIVED' | 'FOLLOWER_GAINED' | 'STORY_ACCEPTED' | 'STORY_REJECTED' | 'MENTION_RECEIVED';
  title: string;
  message: string;
  isRead: boolean;
  storyId?: string;
  data?: any;
  createdAt: string;
}