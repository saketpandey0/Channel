import { CommentItem } from "./CommentItem";
import { type Comment } from "../../types/story";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle } from "../shad";
import {
    commentStory,
    getStoryComments,
    deleteComment,
    updateComment,
    replycomment,
    clapComment,
    removeClapComment
} from "../../api/featureServices";

export const NestedComments = ({ storyId }: {
    storyId: string
}) => {
    const [comment, setComment] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setIsLoading(true);
                const data = await getStoryComments(storyId);
                setComment(data.comments);
                console.log("comment data", data);
            } catch (err: any) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [storyId]);

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        try {
            const addComment = await commentStory(storyId, newComment);
            setComment([...comment, addComment.comment]);
            setNewComment("");
        } catch (err: any) {
            console.error(err);
        }
    }

    const handleReply = async (parentId: string, content: string) => {
        try {
            const newReply = await replycomment(storyId, parentId, content);
            
            // Update the comments state by adding the reply to the correct parent
            const updateCommentsWithReply = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...comment.replies, newReply.comment]
                        };
                    } else if (comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentsWithReply(comment.replies)
                        };
                    }
                    return comment;
                });
            };
            
            setComment(updateCommentsWithReply(comment));
        } catch (err: any) {
            console.error(err);
        }
    }

    const handleClap = async (commentId: string, hasClapped: boolean) => {
        try {
            if (hasClapped) {
                await removeClapComment(storyId, commentId);
            } else {
                await clapComment(storyId, commentId);
            }
            
            // Update the comment's clap status locally
            const updateCommentsClap = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            hasClapped: !hasClapped,
                            clapCount: hasClapped ? comment.clapCount - 1 : comment.clapCount + 1
                        };
                    } else if (comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentsClap(comment.replies)
                        };
                    }
                    return comment;
                });
            };
            
            setComment(updateCommentsClap(comment));
        } catch (err: any) {
            console.error(err);
        }
    }

    const handleDelete = async (commentId: string) => {
        try {
            await deleteComment(storyId, commentId);
            
            // Remove the comment from state
            const removeComment = (comments: Comment[]): Comment[] => {
                return comments.filter(comment => {
                    if (comment.id === commentId) {
                        return false;
                    } else if (comment.replies.length > 0) {
                        comment.replies = removeComment(comment.replies);
                    }
                    return true;
                });
            };
            
            setComment(removeComment(comment));
        } catch (err: any) {
            console.error(err);
        }
    }

    const handleUpdate = async (commentId: string, newContent: string) => {
        try {
            const updatedComment = await updateComment(storyId, commentId, newContent);
            
            // Update the comment in state
            const updateCommentContent = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            content: updatedComment.comment.content
                        };
                    } else if (comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateCommentContent(comment.replies)
                        };
                    }
                    return comment;
                });
            };
            
            setComment(updateCommentContent(comment));
        } catch (err: any) {
            console.error(err);
        }
    }

    return (
        <Card className="bg-slate-200 p-4 rounded-xl border-none">
            <CardHeader>
                <CardTitle>Comments ({comment.length})</CardTitle>
            </CardHeader>
            
            {/* Add Comment Form */}
            <div className="bg-slate-100 p-4 rounded-xl mb-4">
                <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0"></div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="What are your thoughts?"
                            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleAddComment}
                                disabled={!newComment.trim() || isLoading}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? 'Posting...' : 'Post Comment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {isLoading && comment.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">Loading comments...</p>
                    </div>
                ) : comment.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    comment.map((item) => (
                        <CommentItem 
                            key={item.id} 
                            comment={item} 
                            onReply={handleReply} 
                            onClap={handleClap}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            depth={item.depth || 0} 
                        />
                    ))
                )}
            </div>
        </Card>
    )
}