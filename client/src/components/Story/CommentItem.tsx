// components/CommentItem.tsx
import React, { useState, useCallback, memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "../Shad";
import type { Comment } from "../../types/comment";
import { PiHandsClappingThin } from "react-icons/pi";
import { Reply, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  onReply: (parentId: string, content: string) => Promise<void>;
  onClap: (commentId: string, hasClapped: boolean) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
  onUpdate?: (commentId: string, newContent: string) => Promise<void>;
  depth?: number;
  currentUserId?: string;
}

const CommentItem: React.FC<CommentItemProps> = memo(({
  comment, 
  onReply,
  onClap,
  onDelete,
  onUpdate,
  depth = 0,
  currentUserId
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClapToggling, setIsClapToggling] = useState(false);

  const maxDepth = 4;
  const isOwner = currentUserId === comment.authorId;
  const hasReplies = comment.replies && comment.replies.length > 0;

  const handleReplySubmit = useCallback(async () => {
    if (!replyContent.trim() || isSubmittingReply) return;
    
    try {
      setIsSubmittingReply(true);
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmittingReply(false);
    }
  }, [comment.id, replyContent, onReply, isSubmittingReply]);

  const handleUpdateSubmit = useCallback(async () => {
    if (!editContent.trim() || !onUpdate || isUpdating) return;
    
    try {
      setIsUpdating(true);
      await onUpdate(comment.id, editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update comment:', error);
      setEditContent(comment.content); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  }, [comment.id, comment.content, editContent, onUpdate, isUpdating]);

  const handleDelete = useCallback(async () => {
    if (!onDelete || isDeleting) return;
    
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      setIsDeleting(true);
      await onDelete(comment.id);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [comment.id, onDelete, isDeleting]);

  const handleClap = useCallback(async () => {
    if (isClapToggling) return;
    
    try {
      setIsClapToggling(true);
      await onClap(comment.id, comment.hasClapped);
    } catch (error) {
      console.error('Failed to toggle clap:', error);
    } finally {
      setIsClapToggling(false);
    }
  }, [comment.id, comment.hasClapped, onClap, isClapToggling]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'now';
  }, []);

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex space-x-3 py-3">
        <div className="flex-shrink-0">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback className="text-xs bg-blue-500 text-white">
              {comment.author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
              {comment.author.name}
            </span>
            {comment.author.isVerified && (
              <span className="text-blue-500" title="Verified">✓</span>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                (edited)
              </span>
            )}
          </div>
          
          {isEditing ? (
            <div className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 dark:bg-gray-800 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isUpdating}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isUpdating}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSubmit}
                  disabled={!editContent.trim() || isUpdating}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {!isEditing && (
            <div className="flex items-center space-x-4 text-gray-500 dark:text-gray-400">
              <button
                onClick={handleClap}
                disabled={isClapToggling}
                className={`flex items-center space-x-1 hover:text-green-500 transition-colors disabled:opacity-50 ${
                  comment.hasClapped ? 'text-green-500' : ''
                }`}
                title={comment.hasClapped ? 'Remove clap' : 'Clap for this comment'}
              >
                <PiHandsClappingThin size={16} className={isClapToggling ? 'animate-pulse' : ''} />
                <span className="text-xs">{comment.clapCount || 0}</span>
              </button>

              {depth < maxDepth && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                >
                  <Reply size={14} />
                  <span className="text-xs">Reply</span>
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 size={14} />
                    <span className="text-xs">Edit</span>
                  </button>

                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex items-center space-x-1 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      <span className="text-xs">{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    disabled={isSubmittingReply}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent('');
                      }}
                      disabled={isSubmittingReply}
                      className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim() || isSubmittingReply}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmittingReply ? 'Replying...' : 'Reply'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {hasReplies && (
            <div className="mt-4">
              {comment.replies.length > 2 && (
                <button
                  onClick={() => setShowReplies(!showReplies)}
                  className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2 transition-colors"
                >
                  {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  <span>
                    {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
                  </span>
                </button>
              )}
              
              {showReplies && comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onClap={onClap}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  depth={depth + 1}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';

export default CommentItem;