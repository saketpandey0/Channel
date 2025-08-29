import { $createYouTubeNode } from "../nodes/YoutubeNode";
import { $getSelection, $isRangeSelection } from "lexical";
import {type LexicalEditor } from "lexical";
import { IoLogoYoutube } from "react-icons/io5";

export default function InsertYouTubeButton({ editor }: { editor: LexicalEditor }) {
  const handleInsert = () => {
    const url = prompt("Enter YouTube URL:");
    if (!url) return;

    let videoId: string | null = null;
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes("youtube.com")) {
        videoId = parsedUrl.searchParams.get("v");
      } else if (parsedUrl.hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      }
    } catch (e) {
      alert("Invalid URL");
      return;
    }

    if (videoId) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = $createYouTubeNode(videoId!);
          selection.insertNodes([node]);
        }
      });
    } else {
      alert("Could not extract video ID");
    }
  };

  return (
    <button
      onClick={handleInsert}
      className="p-2 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
    >
        <IoLogoYoutube />
    </button>
  );
}
