import type { FC } from "react";
import type { ToolbarProps } from "./types";
import ToolbarButton from "./ToolbarButton";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Video,
  Mic,
  MicOff,
  Undo,
  Redo,
  List,
  ListOrdered,
  Quote,
  Code,
  Youtube,
} from "lucide-react";

interface ToolbarPropsExtended extends ToolbarProps {
  insertList: (ordered: boolean) => void;
  insertBlockquote: () => void;
  insertCodeBlock: () => void;
  handleLinkClick: () => void;
  handleYouTubeClick: () => void;
  toggleRecording: () => void;
  isRecording: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  videoInputRef: React.RefObject<HTMLInputElement>;
}

const Toolbar: FC<ToolbarPropsExtended> = ({
  execCommand,
  isCommandActive,
  handleUndo,
  handleRedo,
  insertList,
  insertBlockquote,
  insertCodeBlock,
  handleLinkClick,
  handleYouTubeClick,
  toggleRecording,
  isRecording,
  isUploading,
  fileInputRef,
  videoInputRef,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToolbarButton onClick={handleUndo} title="Undo">
        <Undo size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={handleRedo} title="Redo">
        <Redo size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-gray-300"></div>

      <ToolbarButton
        onClick={() => execCommand("bold")}
        active={isCommandActive("bold")}
        title="Bold"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execCommand("italic")}
        active={isCommandActive("italic")}
        title="Italic"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execCommand("underline")}
        active={isCommandActive("underline")}
        title="Underline"
      >
        <Underline size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-gray-300"></div>

      <ToolbarButton
        onClick={() => execCommand("justifyLeft")}
        active={isCommandActive("justifyLeft")}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execCommand("justifyCenter")}
        active={isCommandActive("justifyCenter")}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => execCommand("justifyRight")}
        active={isCommandActive("justifyRight")}
        title="Align Right"
      >
        <AlignRight size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-gray-300"></div>

      <ToolbarButton
        onClick={() => insertList(false)}
        active={isCommandActive("insertUnorderedList")}
        title="Bullet List"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => insertList(true)}
        active={isCommandActive("insertOrderedList")}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={insertBlockquote}
        active={isCommandActive("blockquote")}
        title="Quote"
      >
        <Quote size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={insertCodeBlock} title="Code Block">
        <Code size={18} />
      </ToolbarButton>

      <div className="mx-1 h-6 w-px bg-gray-300"></div>

      <ToolbarButton onClick={handleLinkClick} title="Insert Link">
        <Link size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => fileInputRef.current?.click()}
        title="Insert Image"
        disabled={isUploading}
      >
        <Image size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => videoInputRef.current?.click()}
        title="Insert Video"
        disabled={isUploading}
      >
        <Video size={18} />
      </ToolbarButton>
      <ToolbarButton onClick={handleYouTubeClick} title="Insert YouTube Video">
        <Youtube size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={toggleRecording}
        active={isRecording}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      >
        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
      </ToolbarButton>
    </div>
  );
};

export default Toolbar;