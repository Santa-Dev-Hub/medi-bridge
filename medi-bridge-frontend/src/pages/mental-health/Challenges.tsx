import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Calendar, Trophy, CheckCircle, Clock, Star, Sun, Heart, Moon } from 'lucide-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  reward: string;
  status: 'not_started' | 'in_progress' | 'completed';
  icon: React.ReactNode;
  dailyActivities: {
    day: number;
    activity: string;
    completed: boolean;
    date?: string;
  }[];
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Mindful Morning',
      description: 'Start your day with mindfulness and gratitude',
      duration: '7 days',
      progress: 0,
      reward: 'Mindfulness Badge',
      status: 'not_started',
      icon: <Sun className="w-8 h-8" />,
      dailyActivities: [
        { day: 1, activity: `Write down three things you're grateful for`, completed: false },
        { day: 2, activity: 'Practice 5 minutes of mindful breathing', completed: false },
        { day: 3, activity: 'Take a mindful walk in nature', completed: false },
        { day: 4, activity: 'Practice loving-kindness meditation', completed: false },
        { day: 5, activity: 'Do a body scan meditation', completed: false },
        { day: 6, activity: 'Practice mindful eating', completed: false },
        { day: 7, activity: 'Reflect on your week of mindfulness', completed: false }
      ]
    },
    {
      id: '2',
      title: 'Stress Relief',
      description: 'Learn and practice stress management techniques',
      duration: '14 days',
      progress: 0,
      reward: 'Stress Management Expert',
      status: 'not_started',
      icon: <Heart className="w-8 h-8" />,
      dailyActivities: [
        { day: 1, activity: 'Identify your stress triggers', completed: false },
        { day: 2, activity: 'Practice progressive muscle relaxation', completed: false },
        { day: 3, activity: 'Learn deep breathing techniques', completed: false },
        { day: 4, activity: 'Practice guided meditation', completed: false },
        { day: 5, activity: 'Try journaling about your stress', completed: false },
        { day: 6, activity: 'Practice mindful movement', completed: false },
        { day: 7, activity: 'Learn about stress and the body', completed: false },
        { day: 8, activity: 'Practice gratitude journaling', completed: false },
        { day: 9, activity: 'Try a new relaxation technique', completed: false },
        { day: 10, activity: 'Practice self-compassion', completed: false },
        { day: 11, activity: 'Learn about stress management tools', completed: false },
        { day: 12, activity: 'Practice stress-reducing exercises', completed: false },
        { day: 13, activity: 'Create a stress management plan', completed: false },
        { day: 14, activity: 'Reflect on your progress', completed: false }
      ]
    },
    {
      id: '3',
      title: 'Sleep Better',
      description: 'Develop healthy sleep habits',
      duration: '21 days',
      progress: 0,
      reward: 'Sleep Master',
      status: 'not_started',
      icon: <Moon className="w-8 h-8" />,
      dailyActivities: [
        { day: 1, activity: 'Set a consistent bedtime', completed: false },
        { day: 2, activity: 'Create a bedtime routine', completed: false },
        { day: 3, activity: 'Limit screen time before bed', completed: false },
        { day: 4, activity: 'Practice relaxation techniques', completed: false },
        { day: 5, activity: 'Create a sleep-friendly environment', completed: false },
        { day: 6, activity: 'Track your sleep patterns', completed: false },
        { day: 7, activity: 'Practice sleep meditation', completed: false },
        { day: 8, activity: 'Learn about sleep hygiene', completed: false },
        { day: 9, activity: 'Try a sleep-inducing routine', completed: false },
        { day: 10, activity: 'Practice deep breathing before bed', completed: false },
        { day: 11, activity: 'Create a sleep schedule', completed: false },
        { day: 12, activity: 'Try progressive muscle relaxation', completed: false },
        { day: 13, activity: 'Practice mindful bedtime routine', completed: false },
        { day: 14, activity: 'Learn about sleep cycles', completed: false },
        { day: 15, activity: 'Try a sleep meditation', completed: false },
        { day: 16, activity: 'Practice sleep journaling', completed: false },
        { day: 17, activity: 'Create a sleep-friendly diet plan', completed: false },
        { day: 18, activity: 'Try a new relaxation technique', completed: false },
        { day: 19, activity: 'Practice sleep visualization', completed: false },
        { day: 20, activity: 'Create a sleep improvement plan', completed: false },
        { day: 21, activity: 'Reflect on your sleep journey', completed: false }
      ]
    }
  ]);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);

  const startChallenge = (challengeId: string) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, status: 'in_progress' }
        : challenge
    ));
    setSelectedChallenge(challenges.find(c => c.id === challengeId) || null);
  };

  const completeActivity = (challengeId: string, day: number) => {
    setChallenges(challenges.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedActivities = challenge.dailyActivities.map(activity => 
          activity.day === day 
            ? { ...activity, completed: true, date: new Date().toISOString() }
            : activity
        );
        
        const completedCount = updatedActivities.filter(a => a.completed).length;
        const progress = (completedCount / challenge.dailyActivities.length) * 100;
        
        return {
          ...challenge,
          dailyActivities: updatedActivities,
          progress,
          status: progress === 100 ? 'completed' : 'in_progress'
        };
      }
      return challenge;
    }));

    setSelectedChallenge(prev => {
      if (prev && prev.id === challengeId) {
        const updatedActivities = prev.dailyActivities.map(activity => 
          activity.day === day 
            ? { ...activity, completed: true, date: new Date().toISOString() }
            : activity
        );
        
        const completedCount = updatedActivities.filter(a => a.completed).length;
        const progress = (completedCount / prev.dailyActivities.length) * 100;
        
        return {
          ...prev,
          dailyActivities: updatedActivities,
          progress,
          status: progress === 100 ? 'completed' : 'in_progress'
        };
      }
      return prev;
    });
  };

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
                <Trophy className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Wellness Challenges</CardTitle>
                  <CardDescription>Build healthy habits and earn rewards</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-primary">{challenge.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{challenge.title}</h3>
                          {challenge.status === 'completed' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{challenge.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{challenge.reward}</span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Progress value={challenge.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(challenge.progress)}% Complete
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          {selectedChallenge ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {selectedChallenge.icon}
                  <div>
                    <CardTitle>{selectedChallenge.title}</CardTitle>
                    <CardDescription>{selectedChallenge.duration}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Daily Activities</h3>
                    {selectedChallenge.status === 'not_started' && (
                      <Button
                        onClick={() => startChallenge(selectedChallenge.id)}
                        size="sm"
                      >
                        Start Challenge
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedChallenge.dailyActivities.map((activity) => (
                      <Card
                        key={activity.day}
                        className={`p-4 ${
                          activity.completed ? 'bg-green-50 dark:bg-green-950' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Day {activity.day}</span>
                              {activity.completed && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.activity}
                            </p>
                            {activity.date && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Completed on {new Date(activity.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          {selectedChallenge.status === 'in_progress' && !activity.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => completeActivity(selectedChallenge.id, activity.day)}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Progress</h3>
                  <Progress value={selectedChallenge.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {Math.round(selectedChallenge.progress)}% Complete
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Reward</h3>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span>{selectedChallenge.reward}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4" />
                  <p>Select a challenge to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Challenges;