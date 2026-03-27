import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { PenTool, Calendar, Clock, Search, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Journal: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('');

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    // Save entries to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(entries));
    
    // Store entries in chatbot's memory
    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const chatbotMemory = {
        type: 'journal_entry',
        userId: user?.id,
        entry: {
          title: lastEntry.title,
          content: lastEntry.content,
          mood: lastEntry.mood,
          tags: lastEntry.tags,
          timestamp: lastEntry.createdAt
        }
      };
      
      // Store in localStorage for chatbot to access
      localStorage.setItem('chatbotMemory', JSON.stringify(chatbotMemory));
    }
  }, [entries, user?.id]);

  const createEntry = () => {
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: title || 'Untitled Entry',
      content,
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEntries([newEntry, ...entries]);
    setTitle('');
    setContent('');
    setMood('');
    setTags('');
    setIsEditing(false);
  };

  const updateEntry = () => {
    if (!selectedEntry) return;

    const updatedEntry: JournalEntry = {
      ...selectedEntry,
      title: title || 'Untitled Entry',
      content,
      mood,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      updatedAt: new Date().toISOString()
    };

    setEntries(entries.map(entry => 
      entry.id === selectedEntry.id ? updatedEntry : entry
    ));
    setSelectedEntry(null);
    setTitle('');
    setContent('');
    setMood('');
    setTags('');
    setIsEditing(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(entry => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
      setIsEditing(false);
    }
  };

  const editEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags.join(', '));
    setIsEditing(true);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesMood = !filterMood || entry.mood === filterMood;
    
    return matchesSearch && matchesMood;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <PenTool className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Smart Journal</CardTitle>
                  <CardDescription>Record your thoughts and feelings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <select
                  value={filterMood}
                  onChange={(e) => setFilterMood(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">All Moods</option>
                  <option value="Happy">Happy</option>
                  <option value="Sad">Sad</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Calm">Calm</option>
                  <option value="Angry">Angry</option>
                </select>
              </div>

              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <Card
                    key={entry.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{entry.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {entry.content}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(entry.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {entry.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              editEntry(entry);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntry(entry.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Edit Entry' : 'New Entry'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your entry a title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">How are you feeling?</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                >
                  <option value="">Select your mood</option>
                  <option value="Happy">Happy</option>
                  <option value="Sad">Sad</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Calm">Calm</option>
                  <option value="Angry">Angry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your thoughts here..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., reflection, goals, gratitude"
                />
              </div>

              <div className="flex justify-end gap-2">
                {isEditing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedEntry(null);
                      setIsEditing(false);
                      setTitle('');
                      setContent('');
                      setMood('');
                      setTags('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  onClick={isEditing ? updateEntry : createEntry}
                  disabled={!content.trim()}
                >
                  {isEditing ? 'Update Entry' : 'Save Entry'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Journal;