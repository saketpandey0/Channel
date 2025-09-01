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
  type: "image" | "video" | "audio";
}

export interface ToolbarProps {
  execCommand: (command: string) => void;
  isCommandActive: (command: string) => boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

export interface StoryBase {
  title: string;
  subtitle: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  publicationId?: string;
  isPremium: boolean;
  allowComments: boolean;
  allowClaps: boolean;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  mediaIds: string[];
}

export interface CreateStoryData extends StoryBase {}

// Update payload always has an id
export interface UpdateStoryData extends StoryBase {
  id: string;
  price?: number;
}

// Client-side state can be either
export type StoryData = Partial<UpdateStoryData> & StoryBase;


export type EditorProps = {
  story: StoryData;
  onUpdate: React.Dispatch<React.SetStateAction<StoryData>>;
  onNext: () => void;
};