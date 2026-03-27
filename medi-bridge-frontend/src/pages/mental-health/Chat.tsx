import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your mental health companion. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Emotional state detection
    const emotionalStates = {
      sadness: ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless'],
      anxiety: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic'],
      happiness: ['happy', 'good', 'great', 'wonderful', 'excited', 'joyful'],
      anger: ['angry', 'mad', 'frustrated', 'irritated', 'annoyed'],
      fear: ['scared', 'afraid', 'fearful', 'terrified', 'anxious'],
      loneliness: ['lonely', 'alone', 'isolated', 'empty', 'abandoned']
    };

    // Check for emotional states
    for (const [emotion, keywords] of Object.entries(emotionalStates)) {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        switch (emotion) {
          case 'sadness':
            return "I'm sorry to hear you're feeling down. It's completely normal to feel this way sometimes. Would you like to talk about what's causing these feelings? I'm here to listen and support you.";
          case 'anxiety':
            return "I understand that anxiety can be really challenging. Let's try a quick grounding exercise: Take three deep breaths, and name three things you can see around you. Would you like to try that together?";
          case 'happiness':
            return "That's wonderful to hear! What's contributing to your positive mood today? It's great to celebrate these moments.";
          case 'anger':
            return "I hear that you're feeling angry. That's a valid emotion. Would you like to talk about what triggered these feelings? Sometimes talking it out can help.";
          case 'fear':
            return "It's natural to feel afraid sometimes. You're not alone in this. Would you like to discuss what's making you feel this way?";
          case 'loneliness':
            return "I understand that feeling lonely can be really difficult. Remember that you're not alone - I'm here to talk, and there are people who care about you. Would you like to talk about what's on your mind?";
        }
      }
    }

    // Check for specific topics
    if (lowerInput.includes('sleep') || lowerInput.includes('insomnia')) {
      return "Sleep difficulties can really impact our mental health. Would you like some tips for better sleep hygiene, or would you prefer to talk about what's affecting your sleep?";
    }

    if (lowerInput.includes('work') || lowerInput.includes('job') || lowerInput.includes('career')) {
      return "Work-related stress is common and can be challenging. Would you like to discuss what's happening at work, or would you prefer some strategies for managing work stress?";
    }

    if (lowerInput.includes('relationship') || lowerInput.includes('partner') || lowerInput.includes('friend')) {
      return "Relationships can be both rewarding and challenging. Would you like to talk about what's happening in your relationships? I'm here to listen and support you.";
    }

    if (lowerInput.includes('help') || lowerInput.includes('support')) {
      return "I'm here to help and support you. Could you tell me more about what you're going through? I'm ready to listen and provide guidance.";
    }

    // Default response for unclear context
    return "I'm here to listen and support you. Could you tell me more about how you're feeling or what's on your mind? The more you share, the better I can help.";
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            <CardTitle>Mental Health Chat</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Chat Messages */}
          <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex items-start gap-2 max-w-[80%] ${
                        message.sender === 'user'
                          ? 'flex-row-reverse'
                          : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.sender === 'user'
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      >
                        {message.sender === 'user' ? (
                          <User className="w-5 h-5 text-primary-foreground" />
                        ) : (
                          <Bot className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p>{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Typing...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chat;