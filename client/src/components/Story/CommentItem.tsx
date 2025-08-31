import { Avatar, AvatarFallback, AvatarImage } from "../Shad";
import { type Comment } from "../../types/story";
import { PiHandsClappingThin } from "react-icons/pi";
import { useState } from "react";
import { MoreHorizontal, Reply, Edit2, Trash2 } from "lucide-react";

interface CommentItemProps {
    comment: Comment;
    onReply: (parentId: string, content: string) => void;
    onClap: (commentId: string, hasClapped: boolean) => void;
    onDelete?: (commentId: string) => void;
    onUpdate?: (commentId: string, newContent: string) => void;
    depth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
    comment, 
    onReply,
    onClap,
    onDelete,
    onUpdate,
    depth = 0
}) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showReplies, setShowReplies] = useState(true);

    const maxDepth = 4; // Limit nesting depth

    const handleReplySubmit = () => {
        if (replyContent.trim()) {
            onReply(comment.id, replyContent);
            setReplyContent('');
            setShowReplyForm(false);
        }
    };

    const handleUpdateSubmit = () => {
        if (editContent.trim() && onUpdate) {
            onUpdate(comment.id, editContent);
            setIsEditing(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        return 'now';
    };

    return (
        <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''}`}>
            <div className="flex space-x-3 py-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.author.avatar} />
                        <AvatarFallback className="text-xs">
                            {comment.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{comment.author.name}</span>
                        <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
                    </div>
                    
                    {isEditing ? (
                        <div className="mb-3">
                            <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full p-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(comment.content);
                                    }}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateSubmit}
                                    disabled={!editContent.trim()}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-800 text-sm leading-relaxed mb-3">
                            {comment.content}
                        </p>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                        <div className="flex items-center space-x-4 text-gray-500">
                            <button
                                onClick={() => onClap(comment.id, comment.hasClapped)}
                                className={`flex items-center space-x-1 hover:text-green-500 transition-colors ${
                                    comment.hasClapped ? 'text-green-500' : ''
                                }`}
                            >
                                <PiHandsClappingThin size={16} />
                                <span className="text-xs">{comment.clapCount}</span>
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

                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-1 hover:text-blue-500 transition-colors"
                            >
                                <Edit2 size={14} />
                                <span className="text-xs">Edit</span>
                            </button>

                            {onDelete && (
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={14} />
                                    <span className="text-xs">Delete</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Reply Form */}
                    {showReplyForm && (
                        <div className="mt-3">
                            <div className="flex space-x-3">
                                <div className="w-6 h-6 rounded-full bg-gray-300 flex-shrink-0"></div>
                                <div className="flex-1">
                                    <textarea
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="w-full p-2 border border-gray-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={2}
                                    />
                                    <div className="flex justify-end space-x-2 mt-2">
                                        <button
                                            onClick={() => {
                                                setShowReplyForm(false);
                                                setReplyContent('');
                                            }}
                                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleReplySubmit}
                                            disabled={!replyContent.trim()}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Nested Replies */}
                    {comment.replies.length > 0 && (
                        <div className="mt-4">
                            {comment.replies.length > 1 && (
                                <button
                                    onClick={() => setShowReplies(!showReplies)}
                                    className="text-xs text-gray-500 hover:text-gray-700 mb-2 transition-colors"
                                >
                                    {showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies
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
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};