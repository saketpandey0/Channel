import React, { useState, useRef, useCallback, useEffect } from "react";
import { uploadImageService, uploadVideoService } from "../../services/contentService";
import { createStory, updateStory } from "../../services/storyService";
import type { MediaItem, StoryData, EditorProps } from "./types";
import Toolbar from "./Toolbar";
import LinkModal, { getYouTubeEmbedUrl } from "./Modals/LinkModal";
import YoutubeModal from "./Modals/YoutubeModal";
import MediaUploads from "./MediaUploads";
import { Button } from "../Shad";
import { 
  generateExcerpt, 
  getWordCount, 
  getReadingTime, 
  insertList as utilInsertList, 
  insertBlockquote as utilInsertBlockquote, 
  insertCodeBlock as utilInsertCodeBlock,
  isCommandActive as utilIsCommandActive
} from "./utils";

const Editor: React.FC<EditorProps> = ({story, onUpdate, onNext}) => {
  const editorRef = useRef<HTMLDivElement>(null!);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const videoInputRef = useRef<HTMLInputElement>(null!);

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

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadedMedia, setUploadedMedia] = useState<MediaItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error" | null>(null);


  useEffect(() => {
    let typingTimer: NodeJS.Timeout;
    let lastSave = Date.now();

    const handleChange = () => {
      const currentTitle = titleRef.current?.value || "";
      const currentContent = editorRef.current?.innerHTML || "";

      if (!(currentTitle.trim() || currentContent.trim())) return;

      const currentStoryData: StoryData = {
        ...story,
        title: currentTitle,
        subtitle: subtitleRef.current?.value || "",
        content: currentContent,
      };

      clearTimeout(typingTimer);
      typingTimer = setTimeout(() => {
        saveStory(currentStoryData, true);
        lastSave = Date.now();
      }, 2000);

      if (Date.now() - lastSave >= 30000) {
        saveStory(currentStoryData, true);
        lastSave = Date.now();
      }
    };

    editorRef.current?.addEventListener("input", handleChange);

    return () => {
      editorRef.current?.removeEventListener("input", handleChange);
      clearTimeout(typingTimer);
    };
  }, [story]);


  const uploadMedia = async (
    file: File,
    type: "image" | "video" | "audio",
  ): Promise<MediaItem | null> => {
    try {
      setIsUploading(true);

      if (!story.id) {
        const result = await createStory({
          ...story,
          status: 'DRAFT',
        });
        onUpdate({ ...story, id: result.id });
      }

      if (!story.id) {
        throw new Error("Story ID is missing, cannot upload media.");
      }

      const formData = new FormData();
      
      const uploadType = type === "audio" ? "video" : type;
      console.log("uploadType", uploadType);
      formData.append(uploadType, file);
      console.log(formData);
        const data = type === "image" 
        ? await uploadImageService(story.id, formData)
        : await uploadVideoService(story.id, formData);

      console.log("Media Data: ", data);

      const mediaItem: MediaItem = {
        id: data.id,
        url: data.url,
        filename: data.filename,
        size: data.size,
        type,
      };
      console.log("Media Item: ", mediaItem);

      setUploadedMedia(prev => [...prev, mediaItem]);
      
      const currentMediaIds = story.mediaIds || [];
      onUpdate({ 
        ...story, 
        mediaIds: [...currentMediaIds, mediaItem.id] 
      });
      
      return mediaItem;
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Failed to upload ${type}: ${error.message}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const saveStory = async (storyData: StoryData, isAutoSave: boolean = false): Promise<string | null> => {
    try {
      setSaveStatus("saving");
      setIsSaving(true);

      const currentContent = editorRef.current?.innerHTML || "";
      const currentTitle = titleRef.current?.value || "";
      const currentSubtitle = subtitleRef.current?.value || "";

      const payload: StoryData = {
        ...storyData,
        title: currentTitle,
        subtitle: currentSubtitle,
        content: currentContent,
        status: "DRAFT", 
        excerpt: storyData.excerpt || generateExcerpt(editorRef.current?.textContent || ""),
        mediaIds: uploadedMedia.map(media => media.id),
      };

      let result;
      if (storyData.id) {
        result = await updateStory(storyData.id, payload);
      } else {
        result = await createStory(payload);
        onUpdate({ ...payload, id: result.id });
      }

      setSaveStatus("saved");
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        console.log("Story saved:", result);
      }
      
      return result.id;
    } catch (error: any) {
      console.error("Save error:", error);
      setSaveStatus("error");
      if (!isAutoSave) {
        alert(`Failed to save story: ${error.message}`);
      }
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

      onUpdate({
        ...story,
        content: editorRef.current?.innerHTML || "",
      });
    }
  }, [history, historyIndex, story, onUpdate]);

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

    const mediaItem = await uploadMedia(file, 'image');
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
        img.setAttribute('data-media-id', mediaItem.id);
        
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

    const mediaItem = await uploadMedia(file, 'video');
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
            const result = await uploadMedia(audioFile, 'audio');
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

  const insertList = (ordered: boolean = false) => {
    utilInsertList(ordered, editorRef, saveToHistory);
  };

  const insertBlockquote = () => {
    utilInsertBlockquote(saveToHistory);
  };

  const insertCodeBlock = () => {
    utilInsertCodeBlock(saveToHistory);
  };

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

  const handlePublish = async () => {
    const currentStoryData: StoryData = {
      ...story,
      title: titleRef.current?.value || "",
      subtitle: subtitleRef.current?.value || "",
      content: editorRef.current?.innerHTML || "",
    };

    const savedId = await saveStory(currentStoryData, false);
    
    if (savedId) {
      onNext();
    }
  };

  // content is loaded from server
  useEffect(() => {
    if (editorRef.current && !story.content) {
      editorRef.current.innerHTML = "<p><br></p>";
      saveToHistory();
    } else if (editorRef.current && story.content) {
      // Load existing content if editing existing story
      editorRef.current.innerHTML = story.content;
      saveToHistory();
    }
  }, [story.id]);

  // Set input values when story changes
  useEffect(() => {
    if (titleRef.current && story.title !== titleRef.current.value) {
      titleRef.current.value = story.title;
    }
    if (subtitleRef.current && story.subtitle !== subtitleRef.current.value) {
      subtitleRef.current.value = story.subtitle;
    }
  }, [story.title, story.subtitle]);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Media URL copied to clipboard");
  };

  return (
    <div className="mx-auto min-h-screen max-w-4xl bg-white dark:bg-sky-950 p-6">
        <header className="max-w-7xl mx-auto flex flex-row items-center justify-evenly gap-32 pt-2 px-4">
            <div className="flex flex-row max-w-4xl items-center gap-4">
                <span className="text-4xl font-serif font-bold text-shadow-blue-500">Channel</span>
                <span>Draft</span>
                <span className="hidden md:block">saket pandey</span>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {isSaving ? "Saving..." : "Saved"}
                </div>
            </div>
            <div>
                <Button variant={"ghost"} size={'sm'} className="bg-green-700/90 text-white rounded-full "
                  onClick={handlePublish}
                >Publish</Button>
            </div>
        </header>

      <div className="sticky top-0 z-10 mb-6 border-b border-gray-200 bg-white dark:bg-gray-900 rounded-xl p-4">
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

      {isUploading && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-blue-700">Uploading media...</span>
        </div>
      )}

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

      <div className="mb-6">
        <input
          ref={titleRef}
          type="text"
          placeholder="Title"
          defaultValue={story.title}
          onChange={(e) => {
            onUpdate({ ...story, title: e.target.value });
          }}
          className="w-full border-none bg-transparent text-4xl leading-tight font-bold text-gray-900 font-serif-custom tracking-tight dark:text-gray-200 placeholder-gray-400 outline-none"
        />
      </div>

      <div className="mb-8">
        <input
          ref={subtitleRef}
          type="text"
          placeholder="Tell your story..."
          defaultValue={story.subtitle}
          onChange={(e) => {
            onUpdate({ ...story, subtitle: e.target.value });
          }}
          className="w-full border-none bg-transparent text-xl leading-relaxed text-gray-600 placeholder-gray-400 outline-none dark:text-gray-200 tracking-tighter font-serif-custom"
        />
      </div>

      {isRecording && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
          <span className="text-sm text-red-700">Recording audio...</span>
        </div>
      )}

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
          className="min-h-96 border-none text-lg leading-relaxed text-gray-800 dark:text-gray-200 tracking-tighter  tracking-tighter font-serif-custom focus:outline-none"
          style={{
            wordWrap: "break-word",
            whiteSpace: "pre-wrap",
          }}
          suppressContentEditableWarning={true}
        />

        {(!editorRef.current?.textContent ||
          editorRef.current?.textContent === "") && (
          <div className="pointer-events-none absolute top-0 left-0 text-lg text-gray-400 dark:text-gray-200 tracking-tighter">
            Tell your story...
          </div>
        )}
      </div>

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

      <MediaUploads uploadedMedia={uploadedMedia} onCopyUrl={handleCopyUrl} />

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
                story.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800"
                  : story.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {story.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;