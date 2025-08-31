import React, { useState, useRef, useCallback, useEffect } from "react";
import { Save, Upload, Settings } from "lucide-react";
import { uploadImageService, uploadVideoService } from "../../api/contentService";
import { createStory, updateStory } from "../../api/storyService";
import type { MediaItem, StoryData } from "./types";
import Toolbar from "./Toolbar";
import SettingModal from "./Modals/SettingModal";
import LinkModal, { getYouTubeEmbedUrl } from "./Modals/LinkModal";
import YoutubeModal from "./Modals/YoutubeModal";
import MediaUploads from "./MediaUploads";
import { 
  generateExcerpt, 
  getWordCount, 
  getReadingTime, 
  insertList as utilInsertList, 
  insertBlockquote as utilInsertBlockquote, 
  insertCodeBlock as utilInsertCodeBlock,
  isCommandActive as utilIsCommandActive
} from "./utils";

const IntegratedStoryEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Editor state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Story data
  const [storyData, setStoryData] = useState<StoryData>({
    title: "",
    subtitle: "",
    content: "",
    excerpt: "",
    tags: [],
    isPremium: false,
    allowComments: true,
    allowClaps: true,
    status: "DRAFT",
  });

  // UI state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "error" | null
  >(null);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (storyData.title.trim() || storyData.content.trim()) {
        await handleSave(true); // Auto-save as draft
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [storyData]);

  const uploadMedia = async (
    file: File,
    type: "image" | "video",
  ): Promise<MediaItem | null> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append(type, file);

      const data =
        type === "image"
          ? uploadImageService(formData)
          : uploadVideoService(formData);
      console.log("Media Data: ", data);

      const result = await data;
      console.log("Media Result: ", result);
      const mediaItem: MediaItem = {
        id: result.id,
        url: result.url,
        filename: result.filename,
        size: result.size,
        type,
      };

      setUploadedMedia((prev) => [...prev, mediaItem]);
      return mediaItem;
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Failed to upload ${type}: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveStory = async (
    storyData: StoryData,
    publish: boolean = false,
  ): Promise<string | null> => {
    try {
      setSaveStatus("saving");
      setIsSaving(true);

      const payload = {
        ...storyData,
        status: publish ? "PUBLISHED" : "DRAFT",
        content: editorRef.current?.innerHTML || "",
        excerpt:
          storyData.excerpt ||
          generateExcerpt(editorRef.current?.textContent || ""),
      };

      const result = storyData.id
        ? await updateStory(storyData.id, payload)
        : await createStory(payload);

      setSaveStatus("saved");
      setLastSaved(new Date());
      console.log("Story saved:", result);
      if (!storyData.id) {
        setStoryData((prev) => ({ ...prev, id: result.id }));
      }
      return result.id;
    } catch (error: any) {
      console.error("Save error:", error);
      setSaveStatus("error");
      alert(`Failed to save story: ${error.message}`);
      return null;
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const saveToHistory = useCallback(() => {
    if (editorRef.current) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(editorRef.current.innerHTML);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);

      setStoryData((prev) => ({
        ...prev,
        content: editorRef.current?.innerHTML || "",
      }));
    }
  }, [history, historyIndex]);

  const execCommand = useCallback(
    (command: string, value: string | any = null) => {
      document.execCommand(command, false, value);
      editorRef.current?.focus();
      setTimeout(saveToHistory, 100);
    },
    [saveToHistory],
  );

  const isCommandActive = (command: string): boolean => {
    return utilIsCommandActive(command);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaItem: MediaItem | null = await uploadMedia(file, 'image');
    if (mediaItem) {
        const reader = new FileReader();
        reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target?.result as string;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '16px 0';
        img.style.borderRadius = '8px';
        img.alt = 'Uploaded image';
        
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.insertNode(img);
          range.collapse(false);
        } else if (editorRef.current) {
          editorRef.current.appendChild(img);
        }
        saveToHistory();
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaItem: MediaItem | null = await uploadMedia(file, 'video');
    if (mediaItem) {
      const videoContainer = document.createElement("div");
      videoContainer.style.margin = "16px 0";
      videoContainer.style.borderRadius = "8px";
      videoContainer.style.overflow = "hidden";
      videoContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
      videoContainer.setAttribute("data-media-id", mediaItem.id);

      const video = document.createElement("video");
      video.src = mediaItem.url;
      video.controls = true;
      video.preload = "metadata";
      video.style.width = "100%";
      video.style.height = "auto";
      video.style.display = "block";
      video.style.backgroundColor = "#000";

      const fileInfo = document.createElement("div");
      fileInfo.style.padding = "8px 12px";
      fileInfo.style.backgroundColor = "#f3f4f6";
      fileInfo.style.fontSize = "12px";
      fileInfo.style.color = "#6b7280";
      fileInfo.textContent = `${mediaItem.filename} (${(mediaItem.size / 1024 / 1024).toFixed(2)} MB)`;

      videoContainer.appendChild(video);
      videoContainer.appendChild(fileInfo);

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(videoContainer);
        range.collapse(false);
      } else if (editorRef.current) {
        editorRef.current.appendChild(videoContainer);
      }
      saveToHistory();
    }
    e.target.value = "";
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/wav" });
          const audioFile = new File([blob], `recording-${Date.now()}.wav`, {
            type: "audio/wav",
          });

          try {
            const result = await uploadMedia(audioFile, 'video');
            if (result) {

              const audioContainer = document.createElement("div");
              audioContainer.style.margin = "16px 0";
              audioContainer.style.padding = "12px";
              audioContainer.style.backgroundColor = "#f3f4f6";
              audioContainer.style.borderRadius = "8px";
              audioContainer.style.border = "1px solid #e5e7eb";
              audioContainer.setAttribute("data-media-id", result.id);

              const audio = document.createElement("audio");
              audio.src = result.url;
              audio.controls = true;
              audio.style.width = "100%";

              const label = document.createElement("div");
              label.textContent = "🎙️ Voice Recording";
              label.style.fontSize = "14px";
              label.style.color = "#6b7280";
              label.style.marginBottom = "8px";

              audioContainer.appendChild(label);
              audioContainer.appendChild(audio);

              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.insertNode(audioContainer);
                range.collapse(false);
              } else if (editorRef.current) {
                editorRef.current.appendChild(audioContainer);
              }
              saveToHistory();
            }
          } catch (error) {
            console.error("Error uploading audio:", error);
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  // Link insertion
  const handleLinkClick = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0).cloneRange());
      setShowLinkDialog(true);
    }
  };

  const insertLink = () => {
    if (selectedRange && linkUrl) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectedRange);
        execCommand("createLink", linkUrl);
        setShowLinkDialog(false);
        setLinkUrl("");
        setSelectedRange(null);
      }
    }
  };

  // YouTube insertion
  const handleYouTubeClick = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0).cloneRange());
      setShowYouTubeDialog(true);
    }
  };

  const insertYouTubeVideo = () => {
    if (!youtubeUrl) return;

    const embedUrl = getYouTubeEmbedUrl(youtubeUrl);
    if (!embedUrl) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    const iframeWrapper = document.createElement("div");
    iframeWrapper.style.display = "flex";
    iframeWrapper.style.justifyContent = "center";
    iframeWrapper.style.margin = "16px 0";

    const iframe = document.createElement("iframe");
    iframe.src = embedUrl;
    iframe.width = "560";
    iframe.height = "315";
    iframe.style.maxWidth = "100%";
    iframe.style.aspectRatio = "16/9";
    iframe.style.borderRadius = "8px";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");

    iframeWrapper.appendChild(iframe);

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.insertNode(iframeWrapper);
      range.collapse(false);
    } else if (editorRef.current) {
      editorRef.current.appendChild(iframeWrapper);
    }

    saveToHistory();
    setShowYouTubeDialog(false);
    setYoutubeUrl("");
    setSelectedRange(null);
  };

  // Utility wrapper functions
  const insertList = (ordered: boolean = false) => {
    utilInsertList(ordered, editorRef, saveToHistory);
  };

  const insertBlockquote = () => {
    utilInsertBlockquote(saveToHistory);
  };

  const insertCodeBlock = () => {
    utilInsertCodeBlock(saveToHistory);
  };

  // Undo/Redo functions
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
        setHistoryIndex(newIndex);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex];
        setHistoryIndex(newIndex);
      }
    }
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !storyData.tags.includes(tagInput.trim())) {
      setStoryData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setStoryData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Save handlers
  const handleSave = async (isDraft: boolean = true) => {
    const currentStoryData = {
      ...storyData,
      title: titleRef.current?.value || "",
      subtitle: subtitleRef.current?.value || "",
      content: editorRef.current?.innerHTML || "",
    };

    await saveStory(currentStoryData, !isDraft);
  };

  const handlePublish = async () => {
    if (!storyData.title.trim()) {
      alert("Please add a title before publishing");
      return;
    }
    await handleSave(false);
  };

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "<p><br></p>";
      saveToHistory();
    }
  }, []);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Media URL copied to clipboard");
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-white p-6">
      {/* Top Action Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={handlePublish}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            <Upload size={16} />
            Publish
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
          >
            <Settings size={16} />
            Settings
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          {saveStatus === "saving" && <span>Saving...</span>}
          {saveStatus === "saved" && (
            <span className="text-green-600">Saved</span>
          )}
          {saveStatus === "error" && (
            <span className="text-red-600">Save failed</span>
          )}
          {lastSaved && (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      {/* Main Toolbar */}
      <div className="sticky top-0 z-10 mb-6 border-b border-gray-200 bg-white p-4">
        <Toolbar
          execCommand={execCommand}
          isCommandActive={isCommandActive}
          handleUndo={handleUndo}
          handleRedo={handleRedo}
          insertList={insertList}
          insertBlockquote={insertBlockquote}
          insertCodeBlock={insertCodeBlock}
          handleLinkClick={handleLinkClick}
          handleYouTubeClick={handleYouTubeClick}
          toggleRecording={toggleRecording}
          isRecording={isRecording}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          videoInputRef={videoInputRef}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-blue-700">Uploading media...</span>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Title */}
      <div className="mb-6">
        <input
          ref={titleRef}
          type="text"
          placeholder="Title"
          value={storyData.title}
          onChange={(e) =>
            setStoryData((prev) => ({ ...prev, title: e.target.value }))
          }
          className="w-full border-none bg-transparent text-4xl leading-tight font-bold text-gray-900 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Subtitle */}
      <div className="mb-8">
        <input
          ref={subtitleRef}
          type="text"
          placeholder="Tell your story..."
          value={storyData.subtitle}
          onChange={(e) =>
            setStoryData((prev) => ({ ...prev, subtitle: e.target.value }))
          }
          className="w-full border-none bg-transparent text-xl leading-relaxed text-gray-600 placeholder-gray-400 outline-none"
        />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
          <span className="text-sm text-red-700">Recording audio...</span>
        </div>
      )}

      {/* Main Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const br = document.createElement("br");
                const br2 = document.createElement("br");

                range.deleteContents();
                range.insertNode(br);
                range.insertNode(br2);
                range.setStartAfter(br2);
                range.setEndAfter(br2);
                range.collapse(false);

                selection.removeAllRanges();
                selection.addRange(range);

                setTimeout(saveToHistory, 100);
              }
              return;
            }

            if (
              (e.ctrlKey || e.metaKey) &&
              ["b", "i", "u"].includes(e.key.toLowerCase())
            ) {
              setTimeout(saveToHistory, 100);
            }

            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
              e.preventDefault();
              if (e.shiftKey) {
                handleRedo();
              } else {
                handleUndo();
              }
            }
          }}
          onInput={saveToHistory}
          className="min-h-96 border-none text-lg leading-relaxed text-gray-800 focus:outline-none"
          style={{
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
          suppressContentEditableWarning={true}
        />

        {/* Placeholder when empty */}
        {(!editorRef.current?.textContent ||
          editorRef.current?.textContent === "") && (
          <div className="pointer-events-none absolute top-0 left-0 text-lg text-gray-400">
            Tell your story...
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        storyData={storyData}
        onStoryDataChange={setStoryData}
        tagInput={tagInput}
        onTagInputChange={setTagInput}
        onAddTag={addTag}
        onRemoveTag={removeTag}
      />

      {/* YouTube Video Dialog */}
      <YoutubeModal
        isOpen={showYouTubeDialog}
        onClose={() => {
          setShowYouTubeDialog(false);
          setYoutubeUrl("");
          setSelectedRange(null);
        }}
        youtubeUrl={youtubeUrl}
        onUrlChange={setYoutubeUrl}
        onInsert={insertYouTubeVideo}
      />

      {/* Link Dialog */}
      <LinkModal
        isOpen={showLinkDialog}
        onClose={() => {
          setShowLinkDialog(false);
          setLinkUrl("");
          setSelectedRange(null);
        }}
        linkUrl={linkUrl}
        onUrlChange={setLinkUrl}
        onInsert={insertLink}
      />

      {/* Uploaded Media Gallery */}
      <MediaUploads uploadedMedia={uploadedMedia} onCopyUrl={handleCopyUrl} />

      {/* Stats and Footer */}
      <div className="mt-8 border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex gap-4">
            <span>
              Words: {getWordCount(editorRef.current?.textContent || "")}
            </span>
            <span>
              Characters: {editorRef.current?.textContent?.length || 0}
            </span>
            <span>
              Read time: {getReadingTime(editorRef.current?.textContent || "")} min
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              History: {historyIndex + 1}/{history.length}
            </span>
            <span
              className={`rounded px-2 py-1 text-xs ${
                storyData.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : storyData.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {storyData.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedStoryEditor;