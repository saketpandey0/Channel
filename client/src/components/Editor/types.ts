export interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: "image" | "video";
}

export interface ToolbarProps {
  execCommand: (command: string) => void;
  isCommandActive: (command: string) => boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

export interface StoryData {
  id?: string;
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  publicationId?: string;
  isPremium: boolean;
  price?: number;
  allowComments: boolean;
  allowClaps: boolean;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
}