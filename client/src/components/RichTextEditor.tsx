import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link, Image, Video, Mic, MicOff, Undo, Redo, List, ListOrdered, Quote, Code, Youtube } from 'lucide-react';

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  title: string;
}

const RichTextEditor: React.FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const subtitleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showLinkDialog, setShowLinkDialog] = useState<boolean>(false);
  const [showYouTubeDialog, setShowYouTubeDialog] = useState<boolean>(false);
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);


  const saveToHistory = useCallback(() => {
    if (editorRef.current) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(editorRef.current.innerHTML);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [history, historyIndex]);

  // Initialize editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = '<p><br></p>';
      saveToHistory();
    }
  }, []);

  // Format text commands
  const execCommand = useCallback((command: string, value: string | null = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setTimeout(saveToHistory, 100);
  }, [saveToHistory]);

  // Check if command is active
  const isCommandActive = (command: string): boolean => {
    try {
      if (command === 'insertUnorderedList') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          let element = selection.getRangeAt(0).commonAncestorContainer;
          if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentElement;
          }
          return !!(element as Element)?.closest('ul');
        }
        return false;
      }
      if (command === 'insertOrderedList') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          let element = selection.getRangeAt(0).commonAncestorContainer;
          if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentElement;
          }
          return !!(element as Element)?.closest('ol');
        }
        return false;
      }
      if (command === 'blockquote') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          let element = selection.getRangeAt(0).commonAncestorContainer;
          if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentElement;
          }
          return !!(element as Element)?.closest('blockquote');
        }
        return false;
      }
      return document.queryCommandState(command);
    } catch (e) {
      return false;
    }
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle Enter key for proper line breaks
    if (e.key === 'Enter') {
      e.preventDefault();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const br = document.createElement('br');
        const br2 = document.createElement('br');
        
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
    
    // Save to history on certain key combinations
    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key.toLowerCase())) {
      setTimeout(saveToHistory, 100);
    }
    
    // Handle undo/redo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      editorRef.current.innerHTML = history[newIndex];
      setHistoryIndex(newIndex);
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      editorRef.current.innerHTML = history[newIndex];
      setHistoryIndex(newIndex);
    }
  };

  // Handle link insertion
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
        execCommand('createLink', linkUrl);
        setShowLinkDialog(false);
        setLinkUrl('');
        setSelectedRange(null);
      }
    }
  };

  // Handle YouTube video insertion
  const handleYouTubeClick = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSelectedRange(selection.getRangeAt(0).cloneRange());
      setShowYouTubeDialog(true);
    }
  };

const getYouTubeEmbedUrl = (url: string): string | null => {
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11
    ? `https://www.youtube.com/embed/${match[1]}`
    : null;
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
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  );

  iframeWrapper.appendChild(iframe);

  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      range.setStartAfter(range.startContainer);
    }

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


  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  // Handle video upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      
      // Create video container with preview
      const videoContainer = document.createElement('div');
      videoContainer.style.margin = '16px 0';
      videoContainer.style.borderRadius = '8px';
      videoContainer.style.overflow = 'hidden';
      videoContainer.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      
      const video = document.createElement('video');
      video.src = videoUrl;
      video.controls = true;
      video.preload = 'metadata';
      video.style.width = '100%';
      video.style.height = 'auto';
      video.style.display = 'block';
      video.style.backgroundColor = '#000';
      
      // Add file info
      const fileInfo = document.createElement('div');
      fileInfo.style.padding = '8px 12px';
      fileInfo.style.backgroundColor = '#f3f4f6';
      fileInfo.style.fontSize = '12px';
      fileInfo.style.color = '#6b7280';
      fileInfo.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
      
      videoContainer.appendChild(video);
      videoContainer.appendChild(fileInfo);
      
      // Add error handling
      video.onerror = () => {
        console.error('Error loading video');
        fileInfo.textContent = 'Error loading video file';
        fileInfo.style.color = '#dc2626';
      };
      
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        fileInfo.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, ${minutes}:${seconds.toString().padStart(2, '0')})`;
      };
      
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
    e.target.value = '';
  };

  // Voice recording functionality
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(blob);
          
          const audioContainer = document.createElement('div');
          audioContainer.style.margin = '16px 0';
          audioContainer.style.padding = '12px';
          audioContainer.style.backgroundColor = '#f3f4f6';
          audioContainer.style.borderRadius = '8px';
          audioContainer.style.border = '1px solid #e5e7eb';
          
          const audio = document.createElement('audio');
          audio.src = audioUrl;
          audio.controls = true;
          audio.style.width = '100%';
          
          const label = document.createElement('div');
          label.textContent = '🎙️ Voice Recording';
          label.style.fontSize = '14px';
          label.style.color = '#6b7280';
          label.style.marginBottom = '8px';
          
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
          
          stream.getTracks().forEach(track => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setAudioChunks(chunks);
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    } else {
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
        setMediaRecorder(null);
      }
    }
  };

  // Insert list
  const insertList = (ordered: boolean = false) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Check if we're already in a list
      let parentElement = range.commonAncestorContainer;
      if (parentElement.nodeType === Node.TEXT_NODE) {
        parentElement = parentElement.parentElement;
      }
      
      // Find if we're inside a list
      const currentList = (parentElement as Element)?.closest('ul, ol');
      
      if (currentList) {
        // If already in a list, remove the list formatting
        const listItems = currentList.querySelectorAll('li');
        const fragment = document.createDocumentFragment();
        
        listItems.forEach(li => {
          const p = document.createElement('p');
          p.innerHTML = li.innerHTML;
          fragment.appendChild(p);
        });
        
        currentList.parentNode?.replaceChild(fragment, currentList);
      } else {
        // Create new list
        const listTag = ordered ? 'ol' : 'ul';
        const list = document.createElement(listTag);
        list.style.marginLeft = '20px';
        list.style.marginTop = '8px';
        list.style.marginBottom = '8px';
        
        const selectedText = selection.toString();
        const listItem = document.createElement('li');
        listItem.style.marginBottom = '4px';
        
        if (selectedText) {
          listItem.textContent = selectedText;
          range.deleteContents();
        } else {
          listItem.innerHTML = '<br>';
        }
        
        list.appendChild(listItem);
        range.insertNode(list);
        
        // Position cursor in the list item
        const newRange = document.createRange();
        newRange.setStart(listItem, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      saveToHistory();
    }
  };

  // Insert blockquote
  const insertBlockquote = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      
      // Check if we're already in a blockquote
      let parentElement = range.commonAncestorContainer;
      if (parentElement.nodeType === Node.TEXT_NODE) {
        parentElement = parentElement.parentElement;
      }
      
      const currentBlockquote = (parentElement as Element)?.closest('blockquote');
      
      if (currentBlockquote) {
        // If already in blockquote, convert back to paragraph
        const p = document.createElement('p');
        p.innerHTML = currentBlockquote.innerHTML;
        currentBlockquote.parentNode?.replaceChild(p, currentBlockquote);
      } else {
        // Create new blockquote
        const blockquote = document.createElement('blockquote');
        blockquote.style.borderLeft = '4px solid #e5e7eb';
        blockquote.style.paddingLeft = '16px';
        blockquote.style.margin = '16px 0';
        blockquote.style.fontStyle = 'italic';
        blockquote.style.color = '#6b7280';
        blockquote.style.backgroundColor = '#f9fafb';
        blockquote.style.padding = '12px 16px';
        blockquote.style.borderRadius = '4px';
        
        const selectedText = selection.toString();
        
        if (selectedText) {
          blockquote.textContent = selectedText;
          range.deleteContents();
        } else {
          blockquote.innerHTML = 'Quote text...';
        }
        
        range.insertNode(blockquote);
        range.collapse(false);
        
        // Position cursor in the blockquote
        const newRange = document.createRange();
        newRange.selectNodeContents(blockquote);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
      
      saveToHistory();
    }
  };

  // Insert code block
  const insertCodeBlock = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.style.backgroundColor = '#f4f4f4';
      code.style.padding = '12px';
      code.style.display = 'block';
      code.style.borderRadius = '4px';
      code.style.fontFamily = 'monospace';
      code.textContent = selection.toString() || 'Code block';
      pre.appendChild(code);
      
      range.deleteContents();
      range.insertNode(pre);
      range.collapse(false);
      saveToHistory();
    }
  };



const ToolbarButton: React.FC<ToolbarButtonProps> = ({ onClick, active, children, title }) => (
    <button
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-100 transition-colors ${
        active ? 'bg-gray-200 text-blue-600' : 'text-gray-600'
      }`}
      title={title}
      type="button"
    >
      {children}
    </button>
);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      {/* Main Toolbar */}
      <div className="mb-6 p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Undo/Redo */}
          <ToolbarButton onClick={handleUndo} title="Undo">
            <Undo size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={handleRedo} title="Redo">
            <Redo size={18} />
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Text Formatting */}
          <ToolbarButton
            onClick={() => execCommand('bold')}
            active={isCommandActive('bold')}
            title="Bold"
          >
            <Bold size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('italic')}
            active={isCommandActive('italic')}
            title="Italic"
          >
            <Italic size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('underline')}
            active={isCommandActive('underline')}
            title="Underline"
          >
            <Underline size={18} />
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Alignment */}
          <ToolbarButton
            onClick={() => execCommand('justifyLeft')}
            active={isCommandActive('justifyLeft')}
            title="Align Left"
          >
            <AlignLeft size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyCenter')}
            active={isCommandActive('justifyCenter')}
            title="Align Center"
          >
            <AlignCenter size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => execCommand('justifyRight')}
            active={isCommandActive('justifyRight')}
            title="Align Right"
          >
            <AlignRight size={18} />
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Lists and Blocks */}
          <ToolbarButton
            onClick={() => insertList(false)}
            active={isCommandActive('insertUnorderedList')}
            title="Bullet List"
          >
            <List size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => insertList(true)}
            active={isCommandActive('insertOrderedList')}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={insertBlockquote} active={isCommandActive('blockquote')} title="Quote">
            <Quote size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={insertCodeBlock} title="Code Block">
            <Code size={18} />
          </ToolbarButton>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          {/* Media */}
          <ToolbarButton onClick={handleLinkClick} title="Insert Link">
            <Link size={18} />
          </ToolbarButton>
          <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Insert Image">
            <Image size={18} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => videoInputRef.current?.click()}
            title="Insert Video"
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
      </div>

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
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent leading-tight"
        />
      </div>

      {/* Subtitle */}
      <div className="mb-8">
        <input
          ref={subtitleRef}
          type="text"
          placeholder="Tell your story..."
          className="w-full text-xl text-gray-600 placeholder-gray-400 border-none outline-none bg-transparent leading-relaxed"
        />
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-red-700 text-sm">Recording audio...</span>
        </div>
      )}

      {/* Main Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onKeyDown={handleKeyDown}
          onInput={saveToHistory}
          className="min-h-96 text-lg leading-relaxed text-gray-800 focus:outline-none border-none"
          style={{
            wordWrap: 'break-word',
            whiteSpace: 'pre-wrap'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder when empty */}
        {editorRef.current?.textContent === '' && (
          <div className="absolute top-0 left-0 text-gray-400 text-lg pointer-events-none">
            Tell your story...
          </div>
        )}
      </div>

      {/* YouTube Video Dialog */}
      {showYouTubeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert YouTube Video</h3>
            <input
              type="url"
              placeholder="Enter YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="text-sm text-gray-500 mb-4">
              Paste a YouTube URL like: https://www.youtube.com/watch?v=...
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowYouTubeDialog(false);
                  setYoutubeUrl('');
                  setSelectedRange(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertYouTubeVideo}
                disabled={!youtubeUrl}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowLinkDialog(false);
                  setLinkUrl('');
                  setSelectedRange(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                disabled={!linkUrl}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
        <span>Rich Text Editor - Built from Scratch</span>
        <span>History: {historyIndex + 1}/{history.length}</span>
      </div>
    </div>
  );
};

export default RichTextEditor;