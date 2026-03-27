import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Users, Send, Heart, MessageCircle, Flag } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Community: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Sarah',
      content: 'Just completed my first week of daily meditation. Feeling more centered and focused!',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      likes: 12,
      comments: [
        {
          id: '1',
          author: 'Mike',
          content: 'That\'s amazing! Keep up the great work!',
          timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        },
      ],
    },
    {
      id: '2',
      author: 'Alex',
      content: 'Struggling with anxiety today. Any tips for quick grounding techniques?',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      likes: 8,
      comments: [
        {
          id: '1',
          author: 'Emma',
          content: 'Try the 5-4-3-2-1 technique: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        },
      ],
    },
  ]);

  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: Date.now().toString(),
      author: 'You',
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: [],
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  const handleComment = (postId: string) => {
    if (!newComment[postId]?.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'You',
      content: newComment[postId],
      timestamp: new Date(),
    };

    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));

    setNewComment({ ...newComment, [postId]: '' });
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post =>
      post.id === postId
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Community Support</CardTitle>
                  <CardDescription>A safe space to share, connect, and support each other</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* New Post */}
              <Card>
                <CardContent className="p-4">
                  <Textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your thoughts, experiences, or ask for support..."
                    className="min-h-[100px] mb-4"
                  />
                  <Button
                    onClick={handlePost}
                    className="w-full"
                    disabled={!newPost.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Share Post
                  </Button>
                </CardContent>
              </Card>

              {/* Posts */}
              {posts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{post.author}</h3>
                          <p className="text-sm text-muted-foreground">
                            {post.timestamp.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground"
                        >
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className="text-muted-foreground"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          {post.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.comments.length}
                        </Button>
                      </div>

                      {/* Comments */}
                      <div className="space-y-4 mt-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="pl-4 border-l-2 border-muted">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium">{comment.author}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {comment.timestamp.toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <p className="mt-1">{comment.content}</p>
                          </div>
                        ))}

                        {/* New Comment */}
                        <div className="flex gap-2">
                          <Input
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                            placeholder="Write a comment..."
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleComment(post.id)}
                            size="icon"
                            disabled={!newComment[post.id]?.trim()}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Community;