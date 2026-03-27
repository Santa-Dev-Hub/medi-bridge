import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';

// Avatar fallback for initials
function Avatar({ name }: { name: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-lg text-primary">
      {name[0]?.toUpperCase()}
    </div>
  );
}

interface User {
  id: string | number;
  name: string;
  role: string;
  specialization?: string;
}

interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  replies?: Comment[];
}

interface Post {
  id: string;
  author: User;
  content: string;
  comments: Comment[];
  createdAt: Date;
  imageUrl?: string;
}

function formatTime(date: Date) {
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    // Show time ago
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  }
  // Show date
  return date.toLocaleDateString();
}

const mockPosts: Post[] = [
  {
    id: '1',
    author: { id: 'u1', name: 'Alice', role: 'user' },
    content: 'What are some good tips for managing stress?',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    imageUrl: '',
    comments: [
      {
        id: 'c1',
        author: { id: 'd1', name: 'Dr. Smith', role: 'doctor', specialization: 'Psychiatry' },
        content: 'Regular exercise and mindfulness can help a lot!',
        createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        replies: [
          {
            id: 'c1r1',
            author: { id: 'u2', name: 'Bob', role: 'user' },
            content: 'Thanks, Dr. Smith! Any recommended mindfulness apps?',
            createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
            replies: []
          }
        ]
      }
    ]
  },
  {
    id: '2',
    author: { id: 'd2', name: 'Dr. Lee', role: 'doctor', specialization: 'Nutrition' },
    content: 'Remember to stay hydrated and eat a balanced diet.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    imageUrl: '',
    comments: []
  }
];

// Recursive function to add a reply to a comment by id
function addReplyToComment(comments: Comment[], commentId: string, reply: Comment): Comment[] {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, replies: [...(comment.replies || []), reply] };
    } else if (comment.replies && comment.replies.length > 0) {
      return { ...comment, replies: addReplyToComment(comment.replies, commentId, reply) };
    } else {
      return comment;
    }
  });
}

export default function CommunityForum() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPost, setNewPost] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handlePost = () => {
    if (!newPost.trim() || !user) return;
    const post: Post = {
      id: Date.now().toString(),
      author: user,
      content: newPost.trim(),
      comments: [],
      createdAt: new Date(),
      imageUrl: imagePreview || '',
    };
    setPosts([post, ...posts]);
    setNewPost('');
    setImagePreview(null);
  };

  const handleComment = (postId: string, comment: string, parentCommentId?: string) => {
    if (!comment.trim() || !user) return;
    setPosts(posts =>
      posts.map(post => {
        if (post.id !== postId) return post;
        if (!parentCommentId) {
          // Add as a top-level comment
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Date.now().toString(),
                author: user,
                content: comment.trim(),
                createdAt: new Date(),
                replies: []
              }
            ]
          };
        } else {
          // Add as a reply to a comment
          return {
            ...post,
            comments: addReplyToComment(post.comments, parentCommentId, {
              id: Date.now().toString(),
              author: user,
              content: comment.trim(),
              createdAt: new Date(),
              replies: []
            })
          };
        }
      })
    );
  };

  // Enhanced recursive comment rendering with better UI
  function CommentThread({ comments, postId, level = 0, onReply }: {
    comments: Comment[];
    postId: string;
    level?: number;
    onReply: (postId: string, comment: string, parentCommentId?: string) => void;
  }) {
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    return (
      <div className={level > 0 ? `pl-4 border-l-2 border-muted/30 ml-2` : ""} aria-live={level === 0 ? 'polite' : undefined}>
        {comments.map((comment, idx) => (
          <div key={comment.id} className={`flex items-start gap-2 rounded p-2 mt-2 ${level === 0 ? 'bg-muted/40 shadow-sm mb-2' : 'bg-muted/20'} ${level > 0 ? 'mt-1' : ''}`}
            style={{ marginBottom: level === 0 && idx < comments.length - 1 ? 12 : 0 }}>
            <div className={level > 0 ? "w-6 h-6" : "w-8 h-8"}>
              <Avatar name={comment.author.name} />
            </div>
            <div className="flex-1">
              <span className={`font-semibold ${comment.author.role === 'doctor' ? 'text-blue-400' : 'text-gray-400'}`}>{comment.author.role === 'doctor' ? `Dr. ${comment.author.name}` : comment.author.name}</span>
              <span className="ml-2 text-xs text-muted-foreground font-light">{formatTime(comment.createdAt)}</span>
              <div className="text-xs text-muted-foreground font-light ml-1 inline">{comment.author.role === 'doctor' ? '(Doctor)' : '(User)'}</div>
              <div className="text-sm mt-1 mb-1 whitespace-pre-line">{comment.content}</div>
              <Button size="sm" variant="ghost" className="px-2 py-0 text-xs hover:bg-muted/40 transition-colors" onClick={() => setReplyingTo(comment.id)} aria-label="Reply to comment">
                Reply
              </Button>
              {replyingTo === comment.id && (
                <div className="mt-2">
                  <CommentBox onComment={c => { onReply(postId, c, comment.id); setReplyingTo(null); }} compact />
                </div>
              )}
              {Array.isArray(comment.replies) && comment.replies.length > 0 && (
                <CommentThread comments={comment.replies} postId={postId} level={level + 1} onReply={onReply} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Helper to format doctor name only once
  function formatAuthorName(author: User) {
    if (author.role === 'doctor') {
      return author.name.startsWith('Dr.') ? author.name + (author.specialization ? ` (${author.specialization})` : '') : `Dr. ${author.name}${author.specialization ? ` (${author.specialization})` : ''}`;
    }
    return author.name;
  }

  // Responsive and beautiful forum layout
  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-background to-muted/60 py-8 px-1 sm:px-4 md:px-8 flex justify-center">
      <div className="w-full max-w-6xl mx-auto">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur rounded-t-lg shadow-md px-4 py-4 mb-6 border-b border-muted/30 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Community Forum</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">Ask questions, share experiences, and connect with others. Doctors and users can reply!</p>
          </div>
        </div>
        {/* Post input area, inspired by Twitter/Reddit */}
        <div className="bg-background/90 rounded-xl shadow-xl p-6 mb-8 border border-muted/30 flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <Avatar name={user?.name || '?'} />
          </div>
          <div className="flex-1 w-full">
            <Textarea
              placeholder="Share something or ask a question..."
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              className="mb-2 text-base min-h-[60px] rounded-xl shadow-sm border border-muted/30 focus:ring-2 focus:ring-primary/30"
            />
            {imagePreview && (
              <div className="relative w-full max-w-xs mb-2">
                <img src={imagePreview} alt="Preview" className="rounded-lg border border-muted/30 object-contain max-h-48 w-full bg-black" />
                <Button size="sm" variant="destructive" className="absolute top-1 right-1 px-2 py-0 h-6 text-xs" onClick={handleRemoveImage}>Remove</Button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              <label className="cursor-pointer flex items-center gap-1 text-primary hover:underline">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 002.828 2.828L18 9.828M7 7h.01M7 7a4 4 0 015.657 0M7 7v.01" /></svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                Add Photo
              </label>
              <Button onClick={handlePost} disabled={!newPost.trim() && !imagePreview} className="font-semibold px-8 py-2 text-base rounded-full ml-auto">Post</Button>
            </div>
          </div>
        </div>
        {/* Feed of posts */}
        <div className="space-y-10">
          {posts.length === 0 && <div className="text-muted-foreground text-center">No posts yet. Be the first to post!</div>}
          {posts.map((post, idx) => (
            <div key={post.id}>
              <Card className="bg-background/95 shadow-lg rounded-2xl border border-muted/40 hover:shadow-2xl transition-shadow duration-200 group">
                <div className="flex flex-row items-start gap-4 p-4 pb-0">
                  <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                    <Avatar name={post.author.name} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className={`font-semibold text-lg sm:text-xl ${post.author.role === 'doctor' ? 'text-blue-400' : 'text-gray-300'}`}>{formatAuthorName(post.author)}</span>
                      <span className="text-xs text-muted-foreground font-light">({post.author.role.charAt(0).toUpperCase() + post.author.role.slice(1)})</span>
                      <span className="text-xs text-muted-foreground font-light">{formatTime(post.createdAt)}</span>
                    </div>
                    <div className="mt-2 mb-3 text-base sm:text-lg font-medium whitespace-pre-line">{post.content}</div>
                    {post.imageUrl && (
                      <div className="mb-2 flex flex-col items-center">
                        <img
                          src={post.imageUrl}
                          alt="Post"
                          className="rounded-lg border border-muted/30 object-contain max-h-56 w-full bg-black"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setModalImage(post.imageUrl!)}
                        />
                        
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="pt-2 pb-4 px-4">
                  <CommentThread comments={post.comments} postId={post.id} onReply={handleComment} />
                  <div className="mt-4">
                    <CommentBox onComment={comment => handleComment(post.id, comment)} />
                  </div>
                </CardContent>
              </Card>
              {idx < posts.length - 1 && <div className="my-8 border-t border-muted/30" />}
            </div>
          ))}
        </div>
        {/* Modal for full image */}
        {modalImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setModalImage(null)}>
            <div className="relative max-w-3xl w-full flex flex-col items-center">
              <img src={modalImage} alt="Full" className="rounded-lg max-h-[80vh] w-auto object-contain border border-muted/30 bg-black" />
              <Button size="sm" variant="destructive" className="absolute top-2 right-2" onClick={e => { e.stopPropagation(); setModalImage(null); }}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentBox({ onComment, compact = false }: { onComment: (comment: string) => void, compact?: boolean }) {
  const [comment, setComment] = useState('');
  return (
    <div className={`flex gap-2 ${compact ? 'mt-1' : 'mt-2'} items-center`}>
      <label htmlFor={compact ? 'reply-input-compact' : 'reply-input'} className="sr-only">Write a reply</label>
      <Input
        id={compact ? 'reply-input-compact' : 'reply-input'}
        placeholder="Write a reply..."
        value={comment}
        onChange={e => setComment(e.target.value)}
        className={`flex-1 ${compact ? 'h-8 text-xs px-2 py-1' : ''}`}
        onKeyDown={e => {
          if (e.key === 'Enter' && comment.trim()) {
            onComment(comment);
            setComment('');
          }
        }}
        aria-label="Write a reply"
      />
      <Button
        variant={compact ? 'secondary' : 'outline'}
        size={compact ? 'sm' : undefined}
        onClick={() => {
          if (comment.trim()) {
            onComment(comment);
            setComment('');
          }
        }}
        disabled={!comment.trim()}
        className={compact ? 'h-8 px-3 text-xs' : ''}
        aria-label="Reply"
      >
        Reply
      </Button>
    </div>
  );
}

// To enable code-splitting, import this component using React.lazy in your main app/router:
// const CommunityForum = React.lazy(() => import('./components/dashboard/CommunityForum'));
// <Suspense fallback={<div>Loading...</div>}><CommunityForum /></Suspense> 