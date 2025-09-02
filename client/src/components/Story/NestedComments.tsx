import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle } from "../Shad";
import type { Comment, CommentResponse } from "../../types/comment";
import CommentItem from "./CommentItem";
import {
  commentStory,
  getStoryComments,
  deleteComment,
  updateComment,
  replyComment,
  toggleCommentClap,
  getBatchCommentClapData
} from "../../api/featureServices";
import { Loader2, MessageCircle } from "lucide-react";

interface NestedCommentsProps {
  storyId: string;
  currentUserId?: string;
}

const NestedComments: React.FC<NestedCommentsProps> = ({ 
  storyId, 
  currentUserId 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchComments = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data: CommentResponse = await getStoryComments(storyId, page, pagination.limit);
      
      if (append) {
        setComments(prev => [...prev, ...data.comments]);
      } else {
        setComments(data.comments);
      }
      
      setPagination(data.pagination);
      
      if (data.comments.length > 0) {
        const commentIds = extractAllCommentIds(data.comments);
        try {
          const clapData = await getBatchCommentClapData(storyId, commentIds);
          updateCommentsWithClapData(data.comments, clapData);
        } catch (clapError) {
          console.warn('Failed to fetch clap data:', clapError);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      setError(errorMessage);
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storyId, pagination.limit]);

  const extractAllCommentIds = useCallback((comments: Comment[]): string[] => {
    const ids: string[] = [];
    const extractIds = (comment: Comment) => {
      ids.push(comment.id);
      comment.replies?.forEach(extractIds);
    };
    comments.forEach(extractIds);
    return ids;
  }, []);

  const updateCommentsWithClapData = useCallback((
    comments: Comment[], 
    clapData: { [key: string]: { clapCount: number; userClap: boolean } }
  ) => {
    const updateComment = (comment: Comment): Comment => ({
      ...comment,
      clapCount: clapData[comment.id]?.clapCount ?? comment.clapCount,
      hasClapped: clapData[comment.id]?.userClap ?? comment.hasClapped,
      replies: comment.replies?.map(updateComment) ?? []
    });
    
    setComments(prev => prev.map(updateComment));
  }, []);

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await commentStory(storyId, newComment);
      setComments(prev => [response.comment, ...prev]);
      setNewComment("");
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment';
      setError(errorMessage);
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [storyId, newComment, isSubmitting]);

  const handleReply = useCallback(async (parentId: string, content: string) => {
    try {
      const response = await replyComment(parentId, content);
      
      const updateCommentsWithReply = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: [response.comment, ...(comment.replies || [])],
              replyCount: (comment.replyCount || 0) + 1
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentsWithReply(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setComments(updateCommentsWithReply);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add reply';
      setError(errorMessage);
      console.error('Error adding reply:', err);
      throw err; 
    }
  }, []);

  const handleClap = useCallback(async (commentId: string, hasClapped: boolean) => {
    try {
      const response = await toggleCommentClap(commentId);
      
      const updateCommentsClap = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              hasClapped: response.clapped,
              clapCount: response.clapCount
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentsClap(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setComments(updateCommentsClap);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle clap';
      setError(errorMessage);
      console.error('Error toggling clap:', err);
      throw err;
    }
  }, []);

  const handleDelete = useCallback(async (commentId: string) => {
    try {
      await deleteComment(commentId);
      
      const removeComment = (comments: Comment[]): Comment[] => {
        return comments.filter(comment => {
          if (comment.id === commentId) {
            return false;
          } else if (comment.replies && comment.replies.length > 0) {
            comment.replies = removeComment(comment.replies);
          }
          return true;
        });
      };
      
      setComments(removeComment);
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment';
      setError(errorMessage);
      console.error('Error deleting comment:', err);
      throw err;
    }
  }, []);

  const handleUpdate = useCallback(async (commentId: string, newContent: string) => {
    try {
      const response = await updateComment(commentId, newContent);
      
      const updateCommentContent = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              content: response.comment.content,
              isEdited: true
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentContent(comment.replies)
            };
          }
          return comment;
        });
      };
      
      setComments(updateCommentContent);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update comment';
      setError(errorMessage);
      console.error('Error updating comment:', err);
      throw err;
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !isLoading) {
      fetchComments(pagination.page + 1, true);
    }
  }, [pagination.page, pagination.totalPages, isLoading, fetchComments]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAddComment();
    }
  }, [handleAddComment]);

  const hasMoreComments = pagination.page < pagination.totalPages;
  const totalComments = pagination.total;

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <MessageCircle size={20} />
          Comments ({totalComments})
        </CardTitle>
      </CardHeader>
      
      {/* Comment Input */}
      <div className="px-6 pb-6">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {currentUserId ? 'U' : '?'}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts... (Ctrl/Cmd + Enter to submit)"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-3">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {newComment.length}/1000 characters
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isSubmitting || newComment.length > 1000}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        {isLoading && comments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Loading comments...</span>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
              No comments yet
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                onReply={handleReply} 
                onClap={handleClap}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                depth={0}
                currentUserId={currentUserId}
              />
            ))}
            
            {hasMoreComments && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {isLoading ? 'Loading...' : `Load More (${totalComments - comments.length} remaining)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default NestedComments;