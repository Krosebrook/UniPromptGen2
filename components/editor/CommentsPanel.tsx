import React, { useState, useMemo } from 'react';
import { Comment } from '../../types.ts';
import { MOCK_USERS, MOCK_LOGGED_IN_USER } from '../../constants.ts';
import { ChatBubbleLeftRightIcon, CheckCircleIcon, PaperAirplaneIcon } from '../icons/Icons.tsx';

interface CommentsPanelProps {
  templateId: string;
  comments: Comment[];
  selectedVersionString: string;
  onAddComment: (text: string) => void;
  onUpdateComment: (commentId: string, updates: Partial<Comment>) => void;
  canComment: boolean;
}

const userMap = new Map(MOCK_USERS.map(user => [user.id, user]));

const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
}

const CommentItem: React.FC<{ comment: Comment; onUpdateComment: CommentsPanelProps['onUpdateComment'] }> = ({ comment, onUpdateComment }) => {
    const author = userMap.get(comment.authorId);

    return (
        <div className="flex items-start gap-3">
            <img src={author?.avatarUrl} alt={author?.name} className="h-8 w-8 rounded-full mt-1" />
            <div className="flex-1">
                <div className="bg-secondary p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-foreground">{author?.name}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
                </div>
                {!comment.resolved && (
                    <button 
                        onClick={() => onUpdateComment(comment.id, { resolved: true })}
                        className="text-xs text-muted-foreground hover:text-success font-semibold mt-1 flex items-center gap-1"
                    >
                        <CheckCircleIcon className="h-3 w-3" /> Mark as resolved
                    </button>
                )}
            </div>
        </div>
    );
};


const CommentsPanel: React.FC<CommentsPanelProps> = ({ comments, selectedVersionString, onAddComment, onUpdateComment, canComment }) => {
    const [newComment, setNewComment] = useState('');
    const [showResolved, setShowResolved] = useState(false);

    const versionComments = useMemo(() => {
        return comments.filter(c => c.version === selectedVersionString);
    }, [comments, selectedVersionString]);

    const activeComments = versionComments.filter(c => !c.resolved);
    const resolvedComments = versionComments.filter(c => c.resolved);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        onAddComment(newComment);
        setNewComment('');
    };

    return (
        <div className="bg-card shadow-card rounded-lg p-6 flex flex-col gap-4">
            <div className="flex items-center">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold">Comments</h3>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto max-h-80 pr-2">
                {activeComments.length > 0 ? (
                    activeComments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} onUpdateComment={onUpdateComment} />
                    ))
                ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">No active comments on this version.</p>
                )}
                
                {resolvedComments.length > 0 && (
                     <div>
                        <button onClick={() => setShowResolved(!showResolved)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                            {showResolved ? 'Hide' : 'Show'} {resolvedComments.length} resolved comment(s)
                        </button>
                        {showResolved && (
                            <div className="space-y-4 mt-2 opacity-60">
                                {resolvedComments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} onUpdateComment={onUpdateComment} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {canComment && (
                 <div className="flex items-start gap-2 pt-4 border-t border-border">
                    <img src={MOCK_LOGGED_IN_USER.avatarUrl} className="h-8 w-8 rounded-full" />
                    <div className="flex-1 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Leave a comment..."
                            rows={2}
                            className="w-full p-2 pr-10 bg-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button onClick={handleAddComment} disabled={!newComment.trim()} className="absolute top-2 right-2 p-1.5 rounded-full bg-primary text-primary-foreground disabled:opacity-50">
                            <PaperAirplaneIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommentsPanel;